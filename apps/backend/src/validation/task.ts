import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10),
    category: z.string().min(2).max(50),
    rewardAmount: z.number().positive(),
    maxSubmissions: z.number().int().positive().optional(),
    deadline: z.string().datetime().optional(),
  }),
});

export const submitWorkSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({
    taskId: z.string().uuid(),
  }),
});
