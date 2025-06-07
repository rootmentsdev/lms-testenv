
import express from 'express';
import { migrateFoundationOfServiceTraining } from '../controllers/TrainingController.js';
import { MiddilWare } from '../lib/middilWare.js';   // remove if no auth

const router = express.Router();

router.post(
  '/migrate/foundationTraining',
  MiddilWare,                         // comment out if not needed
  migrateFoundationOfServiceTraining
);

export default router;
