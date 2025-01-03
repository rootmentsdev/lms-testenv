import express from 'express';
import { assignModuleToUser, assignAssessmentToUser, ReassignTraining, deleteTrainingController, GetAssessment } from '../controllers/AssessmentAndModule.js';
import { GetuserTraining, GetuserTrainingprocess, GetuserTrainingprocessmodule, UpdateuserTrainingprocess } from '../controllers/CreateUser.js';
import { TrainingDetails } from '../controllers/AssessmentReassign.js';

const router = express.Router();

// Route to assign a module
router.post('/assign-module', assignModuleToUser);
router.post('/assign-assessment', assignAssessmentToUser);
router.get('/getAll/training', GetuserTraining);
router.get('/getAll/trainingprocess', GetuserTrainingprocess)
router.get('/getAll/trainingprocess/module', GetuserTrainingprocessmodule)
router.get('/update/trainingprocess', UpdateuserTrainingprocess)
router.post('/reassign/training', ReassignTraining)
router.delete('/delete/training/:id', deleteTrainingController)
router.get('/get/AllAssessment', GetAssessment)
router.get('/get/Training/details/:id', TrainingDetails)

export default router;
