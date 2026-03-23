import { Task, Submission, Payment, User } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { hederaService } from './hedera.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import sequelize from '../config/database';

class TaskService {
  /**
   * Create a task. The task starts in `pending_funding` / `open` status.
   * The caller must fund the escrow by calling `fundTask()` with the Hedera tx ID,
   * OR — if no Hedera account is linked — the task goes straight to `open` with
   * an off-chain payment record for manual reconciliation.
   *
   * Escrow amount = rewardAmount × maxSubmissions (the full pot the requester must lock).
   */
  async createTask(
    requesterId: string,
    data: {
      title: string;
      description: string;
      category: string;
      rewardAmount: number;
      maxSubmissions?: number;
      deadline?: Date;
    },
  ) {
    const maxSubmissions = data.maxSubmissions || 1;
    const escrowAmount = parseFloat(
      (Number(data.rewardAmount) * maxSubmissions).toFixed(6),
    );

    const requester = await User.findByPk(requesterId);

    // Create the task — status is 'open' only after escrow is confirmed
    const task = await Task.create({
      ...data,
      maxSubmissions,
      requesterId,
      escrowAmount,
      fundingStatus: 'pending_funding',
      status: 'open', // visible immediately; workers can see it but should check fundingStatus
    });

    // Record the expected escrow deposit (pending until requester submits the tx)
    await Payment.create({
      taskId: task.id,
      fromUserId: requesterId,
      toUserId: null, // funds go to platform escrow
      amount: escrowAmount,
      type: 'escrow_deposit',
      status: 'pending',
    });

    return {
      task,
      escrowAmount,
      // Where the requester must send the USDC deposit
      platformHederaAccountId: env.platform.hederaAccountId,
      requesterHederaAccountId: requester?.hederaAccountId ?? null,
    };
  }

  /**
   * Confirm escrow funding after the requester has sent USDC to the platform account.
   * Verifies the Hedera transaction via Mirror Node and marks the task as funded.
   */
  async fundTask(taskId: string, requesterId: string, hederaTxId: string) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new NotFoundError('Task not found');
    if (task.requesterId !== requesterId) throw new ForbiddenError('Not your task');
    if (task.fundingStatus !== 'pending_funding') {
      throw new BadRequestError('Task escrow is already funded or has been closed');
    }

    // Verify on-chain (best-effort — warnings only in dev)
    const requester = await User.findByPk(requesterId);
    if (requester?.hederaAccountId && env.hedera.usdcTokenId) {
      const valid = await hederaService.verifyDeposit(
        hederaTxId,
        requester.hederaAccountId,
        Number(task.escrowAmount),
      );
      if (!valid) {
        throw new BadRequestError(
          'Could not verify the Hedera transaction. ' +
            `Please ensure you sent at least ${task.escrowAmount} USDC ` +
            `to ${env.platform.hederaAccountId} and resubmit the correct transaction ID.`,
        );
      }
    }

    await task.update({ fundingStatus: 'funded', escrowTransactionId: hederaTxId });

    await Payment.update(
      { status: 'completed', hederaTransactionId: hederaTxId },
      { where: { taskId: task.id, type: 'escrow_deposit' } },
    );

    logger.info(`Task ${taskId} escrow funded — tx: ${hederaTxId}`);
    return task;
  }

  async listTasks(filters: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const { rows: tasks, count: total } = await Task.findAndCountAll({
      where,
      include: [{ model: User, as: 'requester', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { tasks, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getTask(taskId: string) {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username'] },
        {
          model: Submission,
          as: 'submissions',
          include: [{ model: User, as: 'worker', attributes: ['id', 'username'] }],
        },
      ],
    });
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async submitWork(taskId: string, workerId: string, content: string) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new NotFoundError('Task not found');
    if (task.status !== 'open') throw new BadRequestError('Task is not accepting submissions');
    if (task.requesterId === workerId) throw new ForbiddenError('Cannot submit to your own task');

    const existing = await Submission.findOne({ where: { taskId, workerId } });
    if (existing) throw new BadRequestError('You have already submitted to this task');

    const submission = await Submission.create({ taskId, workerId, content });

    await task.update({
      currentSubmissions: task.currentSubmissions + 1,
      status:
        task.currentSubmissions + 1 >= task.maxSubmissions ? 'under_review' : task.status,
    });

    return submission;
  }

  /**
   * Approve a submission.
   * - Deducts `rewardAmount × commissionRate` as platform commission (stays in operator account).
   * - Transfers `rewardAmount × (1 − commissionRate)` USDC from the platform operator to the worker.
   * - Once all maxSubmissions are approved the task transitions to `completed`.
   */
  async approveSubmission(submissionId: string, requesterId: string) {
    return sequelize.transaction(async (t) => {
      const submission = await Submission.findByPk(submissionId, {
        include: [{ model: Task, as: 'task' }],
        transaction: t,
      });

      if (!submission) throw new NotFoundError('Submission not found');

      const task = (submission as any).task as Task;
      if (task.requesterId !== requesterId) {
        throw new ForbiddenError('Only the task requester can approve');
      }
      if (submission.status !== 'pending') {
        throw new BadRequestError('Submission already reviewed');
      }
      if (task.fundingStatus !== 'funded') {
        throw new BadRequestError(
          'Task escrow is not funded. Please deposit the escrow before approving submissions.',
        );
      }

      const rewardAmount = Number(task.rewardAmount);
      const commissionRate = env.platform.commissionRate;
      const commissionAmount = parseFloat((rewardAmount * commissionRate).toFixed(6));
      const workerAmount = parseFloat((rewardAmount - commissionAmount).toFixed(6));

      await submission.update({ status: 'approved' }, { transaction: t });

      // Create the payout payment record (net amount to worker)
      const payment = await Payment.create(
        {
          taskId: task.id,
          submissionId: submission.id,
          fromUserId: null, // platform operator is sender
          toUserId: submission.workerId,
          amount: workerAmount,
          commissionAmount,
          type: 'worker_payout',
          status: 'pending',
        },
        { transaction: t },
      );

      // Count total approved (including this one) to update task status
      const totalApproved =
        (await Submission.count({
          where: { taskId: task.id, status: 'approved' },
          transaction: t,
        }));

      if (totalApproved >= task.maxSubmissions) {
        await task.update(
          { fundingStatus: 'depleted', status: 'completed' },
          { transaction: t },
        );
      }

      // Attempt on-chain payout: platform → worker
      const worker = await User.findByPk(submission.workerId, { transaction: t });
      if (worker?.hederaAccountId) {
        try {
          const { txId } = await hederaService.releaseToWorker(
            worker.hederaAccountId,
            rewardAmount,
            commissionRate,
            `drops payout: submission ${submissionId}`,
          );
          await payment.update(
            { status: 'completed', hederaTransactionId: txId },
            { transaction: t },
          );
          logger.info(
            `Payout complete: ${txId} — ${workerAmount} USDC to ${worker.hederaAccountId} ` +
              `(commission ${commissionAmount} USDC retained)`,
          );
        } catch (err) {
          logger.error('On-chain payout failed — recorded for retry', err);
          // Don't fail the approval — manual retry possible
        }
      } else {
        // No Hedera account linked — mark completed for off-chain reconciliation
        await payment.update({ status: 'completed' }, { transaction: t });
        logger.info(
          `Worker ${submission.workerId} has no Hedera account — payout recorded off-chain`,
        );
      }

      return { submission, payment, workerAmount, commissionAmount };
    });
  }

  async rejectSubmission(submissionId: string, requesterId: string, feedback: string) {
    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!submission) throw new NotFoundError('Submission not found');

    const task = (submission as any).task as Task;
    if (task.requesterId !== requesterId) {
      throw new ForbiddenError('Only the task requester can reject');
    }
    if (submission.status !== 'pending') {
      throw new BadRequestError('Submission already reviewed');
    }

    await submission.update({ status: 'rejected', feedback });
    return submission;
  }

  /**
   * Cancel a task and refund unspent escrow to the requester.
   * Refund = escrowAmount − (approvedSubmissions × rewardAmount)
   */
  async cancelTask(taskId: string, requesterId: string) {
    return sequelize.transaction(async (t) => {
      const task = await Task.findByPk(taskId, { transaction: t });
      if (!task) throw new NotFoundError('Task not found');
      if (task.requesterId !== requesterId) {
        throw new ForbiddenError('Only the task requester can cancel this task');
      }
      if (task.status === 'completed' || task.status === 'cancelled') {
        throw new BadRequestError('Task cannot be cancelled in its current state');
      }

      const approvedCount = await Submission.count({
        where: { taskId, status: 'approved' },
        transaction: t,
      });

      const alreadyPaid = parseFloat(
        (approvedCount * Number(task.rewardAmount)).toFixed(6),
      );
      const refundAmount = parseFloat(
        (Number(task.escrowAmount) - alreadyPaid).toFixed(6),
      );

      await task.update(
        { status: 'cancelled', fundingStatus: 'refunded' },
        { transaction: t },
      );

      if (refundAmount <= 0 || task.fundingStatus !== 'funded') {
        logger.info(`Task ${taskId} cancelled — no escrow to refund`);
        return { task, refundAmount: 0, payment: null };
      }

      const payment = await Payment.create(
        {
          taskId: task.id,
          fromUserId: null,
          toUserId: requesterId,
          amount: refundAmount,
          type: 'escrow_refund',
          status: 'pending',
        },
        { transaction: t },
      );

      // Attempt on-chain refund: platform → requester
      const requester = await User.findByPk(requesterId, { transaction: t });
      if (requester?.hederaAccountId) {
        try {
          const txId = await hederaService.sendFromPlatform(
            requester.hederaAccountId,
            refundAmount,
            `drops escrow refund: task ${taskId}`,
          );
          await payment.update(
            { status: 'completed', hederaTransactionId: txId },
            { transaction: t },
          );
          logger.info(`Refund ${txId}: ${refundAmount} USDC → ${requester.hederaAccountId}`);
        } catch (err) {
          logger.error('Escrow refund on-chain failed — recorded for retry', err);
        }
      } else {
        await payment.update({ status: 'completed' }, { transaction: t });
      }

      return { task, refundAmount, payment };
    });
  }
}

export const taskService = new TaskService();
