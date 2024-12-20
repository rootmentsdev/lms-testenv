import express from 'express';
import { assignModuleToUser, assignAssessmentToUser } from '../controllers/AssessmentAndModule.js';

const router = express.Router();

// Route to assign a module
router.post('/assign-module', assignModuleToUser);

// Route to assign an assessment
router.post('/assign-assessment', assignAssessmentToUser);

export default router;
