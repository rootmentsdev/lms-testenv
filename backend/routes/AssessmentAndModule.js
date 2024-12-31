import express from 'express';
import { assignModuleToUser, assignAssessmentToUser, ReassignTraining, deleteTrainingController } from '../controllers/AssessmentAndModule.js';
import { GetuserTraining, GetuserTrainingprocess, UpdateuserTrainingprocess } from '../controllers/CreateUser.js';

const router = express.Router();

// Route to assign a module
router.post('/assign-module', assignModuleToUser);
router.post('/assign-assessment', assignAssessmentToUser);
router.get('/getAll/training', GetuserTraining);
router.get('/getAll/trainingprocess', GetuserTrainingprocess)
router.get('/update/trainingprocess', UpdateuserTrainingprocess)
router.post('/reassign/training', ReassignTraining)
router.delete('/delete/training/:id', deleteTrainingController)

export default router;
