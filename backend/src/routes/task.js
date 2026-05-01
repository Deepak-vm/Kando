import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTask, getTask, updateTask, deleteTask, reorderTasks } from '../controllers/taskController.js';
import { taskSchema, taskUpdateSchema, reorderTasksSchema } from '../validation/schemas.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/columns/:columnId/tasks', validate(taskSchema), createTask);
router.get('/tasks/:taskId', getTask);
router.put('/tasks/:taskId', validate(taskUpdateSchema), updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.post('/tasks/reorder', validate(reorderTasksSchema), reorderTasks);

export default router;
