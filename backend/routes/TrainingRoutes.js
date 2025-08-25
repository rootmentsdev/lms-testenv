import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import { 
  getAssignedTrainings, 
  getMandatoryTrainings, 
  getTrainingById, 
  startTraining, 
  updateTrainingProgress, 
  completeModule, 
  completeTraining,
  getTrainingStats,
  getOverdueTrainings,
  getUpcomingTrainings,
  submitTrainingAssessment,
  getTrainingCertificate
} from '../controllers/TrainingController.js';

const router = express.Router();

// Apply middleware to all routes
router.use(MiddilWare);

/**
 * @swagger
 * /api/user/trainings/assigned:
 *   get:
 *     tags: [Training]
 *     summary: Get assigned trainings for the current user
 *     description: Retrieves all trainings assigned to the authenticated user
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned trainings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Training'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trainings/assigned', getAssignedTrainings);

/**
 * @swagger
 * /api/user/trainings/mandatory:
 *   get:
 *     tags: [Training]
 *     summary: Get mandatory trainings for the current user
 *     description: Retrieves all mandatory trainings for the authenticated user
 *     responses:
 *       200:
 *         description: Successfully retrieved mandatory trainings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Training'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trainings/mandatory', getMandatoryTrainings);

/**
 * @swagger
 * /api/user/training/{trainingId}:
 *   get:
 *     tags: [Training]
 *     summary: Get training details by ID
 *     description: Retrieves detailed information about a specific training including modules and videos
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     responses:
 *       200:
 *         description: Successfully retrieved training details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Training'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Internal server error
 */
router.get('/training/:trainingId', getTrainingById);

/**
 * @swagger
 * /api/user/training/{trainingId}/start:
 *   put:
 *     tags: [Training]
 *     summary: Start a training
 *     description: Updates training status to 'In Progress' when user starts a training
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     responses:
 *       200:
 *         description: Training started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Training started successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Internal server error
 */
router.put('/training/:trainingId/start', startTraining);

/**
 * @swagger
 * /api/user/training/{trainingId}/progress:
 *   put:
 *     tags: [Training]
 *     summary: Update training progress
 *     description: Updates the progress of a specific module within a training
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *                 description: The module ID
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Progress percentage (0-100)
 *             required:
 *               - moduleId
 *               - progress
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Progress updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training or module not found
 *       500:
 *         description: Internal server error
 */
router.put('/training/:trainingId/progress', updateTrainingProgress);

/**
 * @swagger
 * /api/user/training/{trainingId}/module/{moduleId}/complete:
 *   put:
 *     tags: [Training]
 *     summary: Complete a training module
 *     description: Marks a specific module as completed within a training
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The module ID
 *     responses:
 *       200:
 *         description: Module completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Module completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training or module not found
 *       500:
 *         description: Internal server error
 */
router.put('/training/:trainingId/module/:moduleId/complete', completeModule);

/**
 * @swagger
 * /api/user/training/{trainingId}/complete:
 *   put:
 *     tags: [Training]
 *     summary: Complete a training
 *     description: Marks an entire training as completed
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     responses:
 *       200:
 *         description: Training completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Training completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Internal server error
 */
router.put('/training/:trainingId/complete', completeTraining);

/**
 * @swagger
 * /api/user/trainings/stats:
 *   get:
 *     tags: [Training]
 *     summary: Get training statistics
 *     description: Retrieves training statistics for the authenticated user
 *     responses:
 *       200:
 *         description: Successfully retrieved training statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTrainings:
 *                       type: number
 *                     completedTrainings:
 *                       type: number
 *                     inProgressTrainings:
 *                       type: number
 *                     pendingTrainings:
 *                       type: number
 *                     overallProgress:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trainings/stats', getTrainingStats);

/**
 * @swagger
 * /api/user/trainings/overdue:
 *   get:
 *     tags: [Training]
 *     summary: Get overdue trainings
 *     description: Retrieves all overdue trainings for the authenticated user
 *     responses:
 *       200:
 *         description: Successfully retrieved overdue trainings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Training'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trainings/overdue', getOverdueTrainings);

/**
 * @swagger
 * /api/user/trainings/upcoming:
 *   get:
 *     tags: [Training]
 *     summary: Get upcoming trainings
 *     description: Retrieves upcoming trainings for the authenticated user
 *     responses:
 *       200:
 *         description: Successfully retrieved upcoming trainings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Training'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/trainings/upcoming', getUpcomingTrainings);

/**
 * @swagger
 * /api/user/training/{trainingId}/module/{moduleId}/assessment:
 *   post:
 *     tags: [Training]
 *     summary: Submit training assessment
 *     description: Submits assessment answers for a specific module
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *                 description: Object containing question IDs and selected answers
 *             required:
 *               - answers
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Assessment submitted successfully
 *                 score:
 *                   type: number
 *                   description: Assessment score percentage
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training or module not found
 *       500:
 *         description: Internal server error
 */
router.post('/training/:trainingId/module/:moduleId/assessment', submitTrainingAssessment);

/**
 * @swagger
 * /api/user/training/{trainingId}/certificate:
 *   get:
 *     tags: [Training]
 *     summary: Get training certificate
 *     description: Retrieves or generates a certificate for completed training
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     responses:
 *       200:
 *         description: Successfully retrieved certificate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     certificateUrl:
 *                       type: string
 *                       description: URL to download the certificate
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found or not completed
 *       500:
 *         description: Internal server error
 */
router.get('/training/:trainingId/certificate', getTrainingCertificate);

export default router;
