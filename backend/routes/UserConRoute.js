import express from 'express';
import { loginUser } from '../controllers/CreateUser.js'; // Import the login controller

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: This route allows a user to log in with their credentials (e.g., username and password).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successfully logged in, returning a token
 *       401:
 *         description: Unauthorized, invalid credentials
 *       400:
 *         description: Bad request, missing parameters or incorrect data
 */
router.post('/login', loginUser);

export default router;
