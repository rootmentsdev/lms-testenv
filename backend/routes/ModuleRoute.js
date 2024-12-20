import express from 'express'
const router = express.Router();
import { createModule, getModules } from '../controllers/moduleController.js'; // Adjust the path to your controller
import { createAssessment } from '../controllers/AssessmentController.js';

// Route to create a module
router.post('/modules', createModule).post('/assessments', createAssessment).get('/modules/:id?', getModules);

export default router
