// routes/TrainingRoutes.js

import express from 'express';
import { migrateFoundationOfServiceTraining } from '../controllers/TrainingController.js'; // Import the function
import { MiddilWare } from '../lib/middilWare.js'; // If you have any middleware for authentication

const router = express.Router();

// Route to trigger the migration
/**
 * @swagger
 * /api/admin/migrate/foundationTraining:
 *   get:
 *     summary: Migrate "Foundation of Service" training from Assigned to Mandatory
 *     description: This endpoint will move the "Foundation of Service" training from Assigned to Mandatory and clean up duplicates.
 *     responses:
 *       200:
 *         description: Successfully migrated the training.
 *       500:
 *         description: Internal server error.
 */
router.get('/migrate/foundationTraining', MiddilWare, migrateFoundationOfServiceTraining);

export default router;
