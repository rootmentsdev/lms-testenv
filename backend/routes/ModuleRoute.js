import express from 'express'
const router = express.Router();
import { createModule, getModules } from '../controllers/moduleController.js'; // Adjust the path to your controller
import { calculateProgress, createAssessment, createMandatoryTraining, createTraining, getAssessments, GetTrainingById } from '../controllers/AssessmentController.js';
import { GetAllFullTrainingWithCompletion, GetAllTrainingWithCompletion, MandatoryGetAllTrainingWithCompletion } from '../controllers/AssessmentAndModule.js';
import { MiddilWare } from '../lib/middilWare.js';

// Route to create a module
router.post('/modules', createModule)
router.post('/assessments', MiddilWare, createAssessment)
router.get('/modules/:id?', getModules)
router.get('/assessments/:id?', getAssessments)
router.post('/trainings', MiddilWare, createTraining);
router.get('/trainings/:id?', GetTrainingById)
router.get('/get/allusertraining', GetAllTrainingWithCompletion)
router.get('/get/mandatory/allusertraining', MandatoryGetAllTrainingWithCompletion)
router.get('/get/Full/allusertraining', GetAllFullTrainingWithCompletion)
router.get('/get/progress', calculateProgress)
router.post('/mandatorytrainings', MiddilWare, createMandatoryTraining)

export default router
