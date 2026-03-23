import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const taskController = {
  async listTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.listTasks({
        status: req.query.status as string,
        category: req.query.category as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTask(req.params.taskId);
      res.json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /tasks
   * Creates the task and returns the escrow deposit details.
   * Response includes `platformHederaAccountId` and `escrowAmount` so the
   * frontend can guide the requester to make the deposit.
   */
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.createTask(req.user!.userId, req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /tasks/:taskId/fund
   * Requester submits the Hedera transaction ID proving they deposited the escrow.
   * Body: { hederaTxId: string }
   */
  async fundTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.fundTask(
        req.params.taskId,
        req.user!.userId,
        req.body.hederaTxId,
      );
      res.json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /tasks/:taskId/cancel
   * Cancels the task and triggers an escrow refund for unspent funds.
   */
  async cancelTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.cancelTask(req.params.taskId, req.user!.userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async submitWork(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const submission = await taskService.submitWork(
        req.params.taskId,
        req.user!.userId,
        req.body.content,
      );
      res.status(201).json({ status: 'success', data: submission });
    } catch (error) {
      next(error);
    }
  },

  async approveSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.approveSubmission(
        req.params.submissionId,
        req.user!.userId,
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async rejectSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.rejectSubmission(
        req.params.submissionId,
        req.user!.userId,
        req.body.feedback,
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },
};
