import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {createTask, getTasks,getTask , updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/columns/:columnId/tasks', createTask);       
router.get('/columns/:columnId/tasks', getTasks);         
router.get('/tasks/:id', getTask);                        
router.put('/tasks/:id', updateTask);                      
router.delete('/tasks/:id', deleteTask);                 
              

export default router;