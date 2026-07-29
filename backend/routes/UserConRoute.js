import express from 'express';
import { flutterLogin, loginUser, saveFcmToken } from '../controllers/CreateUser.js'; // Import the login controller
import { verifyJWT } from '../lib/JWT.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [User Management]
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
/**
 * @swagger
 * /api/auth/flutter-login:
 *   post:
 *     tags: [User Management]
 *     summary: User login for mobile app (Flutter)
 *     description: Authenticates a user on the Flutter mobile app. Validates credentials locally, or falls back to an external HR verification API and auto-provisions the user profile locally on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empID:
 *                 type: string
 *                 description: Employee ID (can also be email)
 *               password:
 *                 type: string
 *                 description: Password
 *             required:
 *               - empID
 *               - password
 *     responses:
 *       200:
 *         description: Flutter login successful, returns a token and user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Flutter login successful
 *                 token:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Employee ID and password are required.
 *       401:
 *         description: Incorrect password or external authentication failed.
 *       500:
 *         description: Internal server error.
 */
router.post('/flutter-login', flutterLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [User Management]
 *     summary: User logout
 *     description: Logs out a user and tracks the session duration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The session ID to logout
 *             required:
 *               - sessionId
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout tracked successfully
 *                 sessionDuration:
 *                   type: number
 *                   description: Session duration in minutes
 *       400:
 *         description: Bad request - Session ID is required
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Import UserLoginSession model
    const UserLoginSession = (await import('../model/UserLoginSession.js')).default;
    
    const session = await UserLoginSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Calculate session duration
    const logoutTime = new Date();
    const sessionDuration = Math.round((logoutTime - session.loginTime) / (1000 * 60)); // in minutes
    
    session.logoutTime = logoutTime;
    session.isActive = false;
    session.sessionDuration = sessionDuration;
    
    await session.save();
    
    res.status(200).json({
      message: 'Logout tracked successfully',
      sessionDuration
    });
  } catch (error) {
    console.error('Error tracking logout:', error);
    res.status(500).json({ message: 'Failed to track logout' });
  }
});

/**
 * @swagger
 * /api/auth/save-fcm-token:
 *   post:
 *     tags: [User Management]
 *     summary: Save user FCM device token
 *     description: Stores or updates the Firebase Cloud Messaging (FCM) device token for the currently logged-in user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token generated on the client device.
 *             required:
 *               - fcmToken
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *       400:
 *         description: FCM token is required
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: User or Admin not found
 *       500:
 *         description: Internal server error
 */
router.post('/save-fcm-token', verifyJWT, saveFcmToken);

export default router;
