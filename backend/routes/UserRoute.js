import express from 'express';
import { createUser } from '../controllers/CreateUser.js';

const router = express.Router();

// Route to create a user
router.post('/create-user', createUser);

export default router;
