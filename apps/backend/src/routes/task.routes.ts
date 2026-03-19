import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10),
    category: z.string().min(2).max(50),
    rewardAmount: z.number().positive(),
    maxSubmissions: z.number().int().positive().optional(),
    deadline: z.string().datetime().optional(),
  }),
});

const submitWorkSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({
    taskId: z.string().uuid(),
  }),
});

// List tasks (public)
router.get('/', async (req, res: Response, next: NextFunction) => {
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
});

// Get single task (public)
router.get('/:taskId', async (req, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTask(req.params.taskId);
    res.json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
});

// Create task (requesters only)
router.post(
  '/',
  authenticate,
  authorize('requester', 'admin'),
  validate(createTaskSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.createTask(req.user!.userId, req.body);
      res.status(201).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },
);

// Submit work (workers only)
router.post(
  '/:taskId/submissions',
  authenticate,
  authorize('worker', 'admin'),
  validate(submitWorkSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
);

// Approve submission (requester)
router.post(
  '/submissions/:submissionId/approve',
  authenticate,
  authorize('requester', 'admin'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
);

// Reject submission (requester)
router.post(
  '/submissions/:submissionId/reject',
  authenticate,
  authorize('requester', 'admin'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
);

export default router;
