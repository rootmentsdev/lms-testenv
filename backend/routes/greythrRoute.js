import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import {
  getEmployees,
  getEmployeeCategories,
  runExample,
  getTokenStatus,
} from '../controllers/greythrController.js';

const router = express.Router();

/**
 * @swagger
 * /api/greythr/employees:
 *   get:
 *     tags: [GreytHR Integration]
 *     summary: Fetch employee records from greytHR
 *     responses:
 *       200:
 *         description: List of employees from greytHR
 */
router.get('/employees', MiddilWare, getEmployees);

/**
 * @swagger
 * /api/greythr/categories:
 *   get:
 *     tags: [GreytHR Integration]
 *     summary: Fetch employee categories from greytHR
 *     responses:
 *       200:
 *         description: List of employee categories
 */
router.get('/categories', getEmployeeCategories);

/**
 * @swagger
 * /api/greythr/example:
 *   get:
 *     tags: [GreytHR Integration]
 *     summary: Run greytHR usage example and log results
 *     responses:
 *       200:
 *         description: Example executed successfully
 */
router.get('/example', runExample);

/**
 * @swagger
 * /api/greythr/token:
 *   get:
 *     tags: [GreytHR Integration]
 *     summary: Get greytHR token status
 *     responses:
 *       200:
 *         description: Token status info
 */
router.get('/token', getTokenStatus);

export default router;
