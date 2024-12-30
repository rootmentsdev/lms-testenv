import express from 'express'
const router = express.Router();
import { createModule, getModules } from '../controllers/moduleController.js'; // Adjust the path to your controller
import { calculateProgress, createAssessment, createMandatoryTraining, createTraining, getAssessments, GetTrainingById } from '../controllers/AssessmentController.js';
import { GetAllTrainingWithCompletion } from '../controllers/AssessmentAndModule.js';

// Route to create a module
router.post('/modules', createModule)
router.post('/assessments', createAssessment)
router.get('/modules/:id?', getModules)
router.get('/assessments/:id?', getAssessments)
router.post('/trainings', createTraining);
router.get('/trainings/:id?', GetTrainingById)
router.get('/get/allusertraining', GetAllTrainingWithCompletion)
router.get('/get/progress', calculateProgress)
router.post('/mandatorytrainings',createMandatoryTraining)

export default router
