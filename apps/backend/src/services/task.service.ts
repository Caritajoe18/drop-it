import { Task, Submission, Payment, User } from '../models';
import { AppError, NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { hederaService } from './hedera.service';
import { logger } from '../utils/logger';
import sequelize from '../config/database';

class TaskService {
  async createTask(requesterId: string, data: {
    title: string;
    description: string;
    category: string;
    rewardAmount: number;
    maxSubmissions?: number;
    deadline?: Date;
  }) {
    return Task.create({
      ...data,
      maxSubmissions: data.maxSubmissions || 1,
      requesterId,
    });
  }

  async listTasks(filters: { status?: string; category?: string; page?: number; limit?: number }) {
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
      status: task.currentSubmissions + 1 >= task.maxSubmissions ? 'under_review' : task.status,
    });

    return submission;
  }

  async approveSubmission(submissionId: string, requesterId: string) {
    return sequelize.transaction(async (t) => {
      const submission = await Submission.findByPk(submissionId, {
        include: [{ model: Task, as: 'task' }],
        transaction: t,
      });

      if (!submission) throw new NotFoundError('Submission not found');

      const task = (submission as any).task as Task;
      if (task.requesterId !== requesterId) throw new ForbiddenError('Only the task requester can approve');
      if (submission.status !== 'pending') throw new BadRequestError('Submission already reviewed');

      await submission.update({ status: 'approved' }, { transaction: t });

      const payment = await Payment.create(
        {
          taskId: task.id,
          fromUserId: requesterId,
          toUserId: submission.workerId,
          amount: task.rewardAmount,
        },
        { transaction: t },
      );

      // Attempt Hedera on-chain payment
      const requester = await User.findByPk(requesterId, { transaction: t });
      const worker = await User.findByPk(submission.workerId, { transaction: t });

      if (requester?.hederaAccountId && worker?.hederaAccountId) {
        try {
          const txId = await hederaService.processTaskPayment(
            payment.id,
            requester.hederaAccountId,
            worker.hederaAccountId,
            Number(task.rewardAmount),
          );
          logger.info(`On-chain payment completed: ${txId}`);
        } catch (error) {
          logger.error('On-chain payment failed, recorded for retry', error);
        }
      } else {
        logger.info('Hedera accounts not linked — payment recorded off-chain');
        await payment.update({ status: 'completed' }, { transaction: t });
      }

      return { submission, payment };
    });
  }

  async rejectSubmission(submissionId: string, requesterId: string, feedback: string) {
    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!submission) throw new NotFoundError('Submission not found');

    const task = (submission as any).task as Task;
    if (task.requesterId !== requesterId) throw new ForbiddenError('Only the task requester can reject');
    if (submission.status !== 'pending') throw new BadRequestError('Submission already reviewed');

    await submission.update({ status: 'rejected', feedback });
    return submission;
  }
}

export const taskService = new TaskService();
