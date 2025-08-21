import express from 'express';
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} from '../controllers/EmployeeController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management API endpoints
 */

// POST /api/employee - Create a new employee
router.post('/', createEmployee);

// GET /api/employee - Get all employees with pagination and filtering
router.get('/', getAllEmployees);

// GET /api/employee/:id - Get employee by ID (employeeId or MongoDB _id)
router.get('/:id', getEmployeeById);

// PUT /api/employee/:id - Update employee by ID
router.put('/:id', updateEmployee);

// DELETE /api/employee/:id - Delete employee by ID
router.delete('/:id', deleteEmployee);

export default router;