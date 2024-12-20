import express from 'express';
import { loginUser } from '../controllers/CreateUser.js'; // Import the login controller

const router = express.Router();

// Route for user login
router.post('/login', loginUser);

export default router;
