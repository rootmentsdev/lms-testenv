import express from 'express';
import { createTask, getTasks, getTaskById } from '../controllers/TaskController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

/**
 * @swagger
 * /api/tasks/save:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     description: Create a task assigned to a store or employee. Secured with role-based restrictions.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               mode:
 *                 type: string
 *               startDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endDate:
 *                 type: string
 *               endTime:
 *                 type: string
 *               description:
 *                 type: string
 *               additionalInfo:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input or missing fields
 *       500:
 *         description: Internal server error
 */
router.post('/save', MiddilWare, createTask);

/**
 * @swagger
 * /api/tasks/list:
 *   get:
 *     tags: [Tasks]
 *     summary: Retrieve list of tasks
 *     description: Get tasks assigned to the admin's scope using RBAC filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, category, description, etc.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: Filter by store ID (RBAC secured)
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID (RBAC secured)
 *     responses:
 *       200:
 *         description: List of tasks successfully retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/list', MiddilWare, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Retrieve a single task by ID
 *     description: Retrieve specific task details by ID. Secured with RBAC filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID to fetch
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', MiddilWare, getTaskById);

export default router;
