import express from 'express';
import { UserAssessmentGet } from '../controllers/FutterAssessment.js';
const router = express.Router();


router.get('/user/get/assessment', UserAssessmentGet)

export default router;