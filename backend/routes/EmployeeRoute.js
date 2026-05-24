import express from 'express';
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getAllEmployeesWithTrainingDetails
} from '../controllers/EmployeeController.js';
import {
    getAllEmployeesWithTrainingDetailsV2,
    autoSyncEmployees,
    getAllAppRegisteredEmployees,
} from '../controllers/EmployeeManagementController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

/**
 * @swagger
 * /api/employee:
 *   post:
 *     tags: [Employee]
 *     summary: Create a new employee
 *     description: Creates a new employee record in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Employee name
 *               email:
 *                 type: string
 *                 description: Employee email
 *               employeeId:
 *                 type: string
 *                 description: Employee ID
 *             required:
 *               - name
 *               - email
 *               - employeeId
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

// POST /api/employee - Create a new employee
router.post('/', createEmployee);

router.get('/', getAllEmployees);

// ── Named routes MUST be before /:id to avoid param capture ──
router.get('/management/with-training-details', MiddilWare, getAllEmployeesWithTrainingDetailsV2);
router.get('/app-users', MiddilWare, getAllAppRegisteredEmployees);
router.post('/auto-sync', MiddilWare, autoSyncEmployees);
router.get('/test-external-api', MiddilWare, async (req, res) => {
    try {
        const ROOTMENTS_API_TOKEN = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
        const axios = (await import('axios')).default;
        const response = await axios.post('https://rootments.in/api/employee_range', {
            startEmpId: 'EMP1', endEmpId: 'EMP3'
        }, {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${ROOTMENTS_API_TOKEN}` }
        });
        const employees = response.data?.data || [];
        res.status(200).json({ success: true, message: 'External API test successful', employeeCount: employees.length, sampleData: employees.slice(0, 2) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'External API test failed', error: error.message });
    }
});

// ── Param routes LAST ──
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;