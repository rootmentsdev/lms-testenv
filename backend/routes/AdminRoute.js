import express from 'express';
import { getTopUsers, HomeBar, } from '../controllers/DestinationController.js';

const router = express.Router();

// Route to create a user

router.get('/get/HomeProgressData', HomeBar)
router.get('/get/bestThreeUser', getTopUsers)

export default router;