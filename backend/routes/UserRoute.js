import express from 'express';
import { createBranch, createUser, GetAllUser, GetBranch, loginUser } from '../controllers/CreateUser.js';

const router = express.Router();

// Route to create a user
router.post('/create-user', createUser)
router.post('/user-login', loginUser)
router.get('/getAllUser', GetAllUser)
router.post('/create/branch', createBranch)
router.get('/getBranch', GetBranch);

export default router;
