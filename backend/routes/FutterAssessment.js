import express from 'express';
import { UserAssessmentGet, userAssessmentUpdate, Usergetquestions } from '../controllers/FutterAssessment.js';
const router = express.Router();


router.get('/user/get/assessment', UserAssessmentGet)
router.get('/user/get/assessment/quesions', Usergetquestions)
router.post('/user/update/assessment', userAssessmentUpdate)
export default router;