import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    reorderTasks,
    uploadAttachment,
    deleteAttachment
} from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/columns/:columnId/tasks', createTask);
router.get('/columns/:columnId/tasks', getTasks);
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/reorder', reorderTasks);
router.post('/tasks/:taskId/attachments', upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', deleteAttachment);

export default router;