import express from 'express';
import { createBranch, createUser, GetAllUser, GetBranch, loginUser } from '../controllers/CreateUser.js';

const router = express.Router();

// Route to create a user
router.post('/create-user', createUser).post('/user-login', loginUser).get('/getAllUser', GetAllUser).post('/create/branch', createBranch).get('/getBranch', GetBranch);

export default router;
