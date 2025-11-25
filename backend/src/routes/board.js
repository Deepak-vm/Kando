import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {createBoard , getBoards , getBoard , updateBoard , deleteBoard} from '../controllers/boardController.js';

const router = express.Router();


router.use(authMiddleware);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;