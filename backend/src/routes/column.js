import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
    createColumn,
    getColumns,
    updateColumn,
    deleteColumn,
    reorderColumns
} from '../controllers/columnController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/boards/:boardId/columns', createColumn);
router.get('/boards/:boardId/columns', getColumns);
router.put('/columns/:id', updateColumn);
router.delete('/columns/:id', deleteColumn);
router.post('/columns/reorder', reorderColumns);

export default router;