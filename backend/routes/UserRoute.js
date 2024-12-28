import express from 'express';
import { createBranch, createUser, GetAllUser, GetBranch, loginUser } from '../controllers/CreateUser.js';
import { createDesignation, getAllDesignation, } from '../controllers/DestinationController.js';

const router = express.Router();

// Route to create a user
router.post('/create-user', createUser)
router.post('/user-login', loginUser)
router.get('/getAllUser', GetAllUser)
router.post('/create/branch', createBranch)
router.get('/getBranch', GetBranch);
router.post('/create/designation', createDesignation)
router.get('/getAll/designation', getAllDesignation)

export default router;
