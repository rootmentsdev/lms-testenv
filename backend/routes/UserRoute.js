import express from 'express';
import { createUser, loginUser } from '../controllers/CreateUser.js';

const router = express.Router();

// Route to create a user
router.post('/create-user', createUser).post('/user-login', loginUser);

export default router;
