import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/CategoryController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

router.get('/', MiddilWare, getCategories);
router.post('/', MiddilWare, createCategory);
router.put('/:id', MiddilWare, updateCategory);
router.delete('/:id', MiddilWare, deleteCategory);

export default router;
