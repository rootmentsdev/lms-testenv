import express from 'express';
import { assignModuleToUser, assignAssessmentToUser, ReassignTraining, deleteTrainingController, GetAssessment } from '../controllers/AssessmentAndModule.js';
import { GetuserTraining, GetuserTrainingprocess, GetuserTrainingprocessmodule, UpdateuserTrainingprocess } from '../controllers/CreateUser.js';
import { AssessmentAssign, TrainingDetails } from '../controllers/AssessmentReassign.js';
import { GetAssessmentDetails } from '../controllers/moduleController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

// Route to assign a module
/**
 * @swagger
 * /assign-module:
 *   post:
 *     summary: Assign a module to a user
 *     description: Assigns a training or learning module to a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               moduleId:
 *                 type: string
 *             required:
 *               - userId
 *               - moduleId
 *     responses:
 *       200:
 *         description: Module successfully assigned.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post('/assign-module', assignModuleToUser);

/**
 * @swagger
 * /assign-assessment:
 *   post:
 *     summary: Assign an assessment to a user
 *     description: Assigns an assessment to a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               assessmentId:
 *                 type: string
 *             required:
 *               - userId
 *               - assessmentId
 *     responses:
 *       200:
 *         description: Assessment successfully assigned.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post('/assign-assessment', assignAssessmentToUser);

/**
 * @swagger
 * /getAll/training:
 *   get:
 *     summary: Retrieve all user training
 *     description: Fetches a list of all trainings assigned to users.
 *     responses:
 *       200:
 *         description: Successfully retrieved training data.
 *       400:
 *         description: Bad request, invalid parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/getAll/training', GetuserTraining);

/**
 * @swagger
 * /getAll/trainingprocess:
 *   get:
 *     summary: Retrieve all user training processes
 *     description: Fetches the current status or steps of training processes for users.
 *     responses:
 *       200:
 *         description: Successfully retrieved training processes.
 *       400:
 *         description: Bad request, invalid parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/getAll/trainingprocess', GetuserTrainingprocess);

/**
 * @swagger
 * /getAll/trainingprocess/module:
 *   get:
 *     summary: Retrieve all modules in the training process
 *     description: Fetches module details associated with user training processes.
 *     responses:
 *       200:
 *         description: Successfully retrieved training process modules.
 *       400:
 *         description: Bad request, invalid parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/getAll/trainingprocess/module', GetuserTrainingprocessmodule);

/**
 * @swagger
 * /update/trainingprocess:
 *   get:
 *     summary: Update user training process
 *     description: Updates the status or step of a user's training process.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: The ID of the user whose training process is to be updated.
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Module ID to update.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: New status of the training process.
 *     responses:
 *       200:
 *         description: Training process updated successfully.
 *       400:
 *         description: Bad request, invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/update/trainingprocess', UpdateuserTrainingprocess);

/**
 * @swagger
 * /reassign/training:
 *   post:
 *     summary: Reassign training to a user
 *     description: Reassigns or re-schedules training modules for a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               moduleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Training successfully reassigned.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post('/reassign/training', ReassignTraining);

/**
 * @swagger
 * /delete/training/{id}:
 *   delete:
 *     summary: Delete training
 *     description: Deletes a training record or assignment based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the training record
 *     responses:
 *       200:
 *         description: Training deleted successfully.
 *       400:
 *         description: Bad request, invalid training ID.
 *       404:
 *         description: Training not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete/training/:id', deleteTrainingController);

/**
 * @swagger
 * /get/AllAssessment:
 *   get:
 *     summary: Retrieve all assessments
 *     description: Returns a list of all assessments in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved all assessments.
 *       400:
 *         description: Bad request, invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/get/AllAssessment', GetAssessment);

/**
 * @swagger
 * /get/Training/details/{id}:
 *   get:
 *     summary: Get training details
 *     description: Retrieves detailed information about a specific training by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The training ID
 *     responses:
 *       200:
 *         description: Successfully retrieved training details.
 *       404:
 *         description: Training not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get/Training/details/:id', TrainingDetails);

/**
 * @swagger
 * /post/createAssessment:
 *   post:
 *     summary: Create or assign a new assessment
 *     description: Creates a new assessment or assigns an existing assessment to a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assessmentName:
 *                 type: string
 *               userId:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Assessment created/assigned successfully.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post('/post/createAssessment', MiddilWare, AssessmentAssign);

/**
 * @swagger
 * /get/assessment/details/{id}:
 *   get:
 *     summary: Get assessment details
 *     description: Retrieves detailed information about a specific assessment by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment details.
 *       404:
 *         description: Assessment not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get/assessment/details/:id', GetAssessmentDetails);

export default router;
