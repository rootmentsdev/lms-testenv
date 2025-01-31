import express from 'express';
import { handlePermissions, CreatingAdminUsers, getTopUsers, HomeBar, } from '../controllers/DestinationController.js';
import { AdminLogin, ChangeVisibility, getAllNotifications, getEscalationLevel, getNotifications, GetSubroles, getVisibility, Subroles, upsertEscalationLevel } from '../controllers/moduleController.js';
import { VerifyToken } from '../lib/VerifyJwt.js';
import { CreateNotification, FindOverDueAssessment, FindOverDueTraining, SendNotification, SendNotificationAssessment } from '../controllers/AssessmentReassign.js';
import { MiddilWare } from '../lib/middilWare.js';
import { GetAllUserDetailes, UpdateOneUserDetailes } from '../controllers/FutterAssessment.js';

const router = express.Router();

// Route to create a user

router.get('/get/HomeProgressData', MiddilWare, HomeBar);
router.get('/get/bestThreeUser', MiddilWare, getTopUsers);
router.post('/admin/createadmin', CreatingAdminUsers);
router.post('/admin/permission', handlePermissions);
router.post('/setting/visibility', ChangeVisibility);
router.get('/get/setting/visibility', getVisibility);
router.post('/admin/login', AdminLogin);
router.post('/admin/verifyToken', VerifyToken);
router.get('/home/notification', getNotifications);
router.get('/home/AllNotification', getAllNotifications);
router.post('/subroles', Subroles);
router.get('/getSubrole', GetSubroles);
router.post('/escalation/level', upsertEscalationLevel);
router.get('/escalation/level/get', getEscalationLevel);
router.get('/overdue/Assessment', MiddilWare, FindOverDueAssessment);
router.get('/overdue/Training', MiddilWare, FindOverDueTraining);
router.get('/overdue/Training/send/:empId', MiddilWare, SendNotification);
router.get('/overdue/assessment/send/:empId', MiddilWare, SendNotificationAssessment);
router.post('/notification/create', CreateNotification);
router.get('/user/detailed/info/:id', MiddilWare, GetAllUserDetailes);
router.put('/user/update/:id', MiddilWare, UpdateOneUserDetailes);
export default router;