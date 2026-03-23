import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, submitWorkSchema, fundTaskSchema } from '../validation/task';

const router = Router();

// Public
router.get('/', taskController.listTasks);
router.get('/:taskId', taskController.getTask);

// Requester: create → fund → cancel
router.post('/', authenticate, authorize('requester', 'admin'), validate(createTaskSchema), taskController.createTask);
router.post('/:taskId/fund', authenticate, authorize('requester', 'admin'), validate(fundTaskSchema), taskController.fundTask);
router.post('/:taskId/cancel', authenticate, authorize('requester', 'admin'), taskController.cancelTask);

// Worker: submit work
router.post('/:taskId/submissions', authenticate, authorize('worker', 'admin'), validate(submitWorkSchema), taskController.submitWork);

// Requester: review submissions
router.post('/submissions/:submissionId/approve', authenticate, authorize('requester', 'admin'), taskController.approveSubmission);
router.post('/submissions/:submissionId/reject', authenticate, authorize('requester', 'admin'), taskController.rejectSubmission);

export default router;
