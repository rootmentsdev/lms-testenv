import express from 'express'
const router = express.Router();
import { createModule, getModules } from '../controllers/moduleController.js'; // Adjust the path to your controller
import { createAssessment, createTraining, getAssessments } from '../controllers/AssessmentController.js';

// Route to create a module
router.post('/modules', createModule).post('/assessments', createAssessment).get('/modules/:id?', getModules).get('/assessments/:id?', getAssessments).post('/trainings', createTraining);

export default router
