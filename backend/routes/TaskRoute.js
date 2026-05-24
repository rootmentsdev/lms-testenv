import express from 'express';
import { createTask, getTasks, getTaskById } from '../controllers/TaskController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

router.post('/save', MiddilWare, createTask);
router.get('/list', MiddilWare, getTasks);
router.get('/:id', MiddilWare, getTaskById);

export default router;
