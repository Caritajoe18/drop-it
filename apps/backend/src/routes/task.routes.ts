import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, submitWorkSchema } from '../validation/task';

const router = Router();

router.get('/', taskController.listTasks);
router.get('/:taskId', taskController.getTask);
router.post('/', authenticate, authorize('requester', 'admin'), validate(createTaskSchema), taskController.createTask);
router.post('/:taskId/submissions', authenticate, authorize('worker', 'admin'), validate(submitWorkSchema), taskController.submitWork);
router.post('/submissions/:submissionId/approve', authenticate, authorize('requester', 'admin'), taskController.approveSubmission);
router.post('/submissions/:submissionId/reject', authenticate, authorize('requester', 'admin'), taskController.rejectSubmission);

export default router;
