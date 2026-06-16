import express from 'express';
import { checkCustomerExists, saveWalkin, getWalkins, getAllWalkinsPublic, getCronLogs } from '../controllers/WalkinController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Walkin
 *   description: Walk-in lead management API endpoints for Web Dashboard and Mobile App Integrations
 */

/**
 * @swagger
 * /api/walkin/check/{contact}:
 *   get:
 *     tags: [Walkin]
 *     summary: Check if a customer exists by contact phone number (Used by Mobile App)
 *     description: >
 *       **Where to use:** Use this API in the mobile app (or POS frontend) right after the user enters a phone number.
 *       
 *       **What it does:** Checks the database to find if a lead with this exact phone number already exists.
 *       If it does, it returns their latest details (Name, Function Date, etc.) so the mobile app can automatically pre-fill the form fields.
 *     parameters:
 *       - in: path
 *         name: contact
 *         required: true
 *         schema:
 *           type: string
 *         description: 10-digit contact phone number of the customer
 *     responses:
 *       200:
 *         description: Check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 exists:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Customer exists"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customerName:
 *                       type: string
 *                       example: "Adithyan"
 *                     contact:
 *                       type: string
 *                       example: "9876543210"
 *                     functionDate:
 *                       type: string
 *                       example: "2026-06-25"
 *                     remarks:
 *                       type: string
 *                       example: "Prefers slim fit"
 *                     status:
 *                       type: string
 *                       enum: [New Walkin, Revisit, Loss]
 *                       example: "Revisit"
 *                     repeatCount:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - Missing contact number
 *       500:
 *         description: Internal server error
 */
import jwt from 'jsonwebtoken';

const OptionalMiddilWare = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = decoded;
        }
        next();
    } catch (error) {
        next();
    }
};

router.get('/check/:contact', OptionalMiddilWare, checkCustomerExists);


/**
 * @swagger
 * /api/walkin/save:
 *   post:
 *     tags: [Walkin]
 *     summary: Save a new walk-in / lead record
 *     description: Save or update a walk-in entry from Mobile App or Web Dashboard.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - contact
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "Adithyan"
 *               contact:
 *                 type: string
 *                 example: "9876543210"
 *               functionDate:
 *                 type: string
 *                 example: "2026-06-25"
 *               store:
 *                 type: string
 *                 example: "G-Edappally"
 *               staff:
 *                 type: string
 *                 example: "Jane Doe"
 *               storeId:
 *                 type: string
 *                 example: "6a158244cb0a54bf2ec3b7c4"
 *               employeeId:
 *                 type: string
 *                 example: "6a1fe984b7cd1be0b146e658"
 *               functionType:
 *                 type: string
 *                 enum:
 *                   - "Hindu Function"
 *                   - "Christian Function"
 *                   - "Muslim Function"
 *                   - "Grooms Men"
 *                   - "Office or College"
 *                   - "Others functions"
 *                 example: "Hindu Function"
 *               category:
 *                 type: string
 *                 enum:
 *                   - "product"
 *                   - "enquiry"
 *                   - "dapper squad"
 *                   - "customisation"
 *                 example: "product"
 *               subCategory:
 *                 type: string
 *                 example: "shirt"
 *               remarks:
 *                 type: string
 *                 example: "Price too High"
 *               notes:
 *                 type: string
 *                 example: "Customer wants premium fabric"
 *               lossProductType:
 *                 type: string
 *                 example: "Suit"
 *               lossSize:
 *                 type: string
 *                 example: "38"
 *               lossColour:
 *                 type: string
 *                 example: "Navy Blue"
 *               lossSalesPrice:
 *                 type: string
 *                 example: "12000"
 *               lossSelectRemarks:
 *                 type: string
 *                 example: "Budget restriction"
 *               lossReason:
 *                 type: string
 *                 example: "design and color unavailable"
 *               lossEnquiryTrailOption:
 *                 type: string
 *                 example: "Just Visit"
 *               lossEnquiryRevisitDate:
 *                 type: string
 *                 example: "2026-06-30"
 *               repeatCount:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum:
 *                   - "New Walkin"
 *                   - "Revisit"
 *                   - "Loss"
 *                   - "Trial"
 *                   - "Reissue"
 *                   - "Booked"
 *                   - "Rentout"
 *                   - "Return"
 *                   - "Other"
 *                 example: "Loss"
 *               date:
 *                 type: string
 *                 example: "2026-06-15"
 *     responses:
 *       200:
 *         description: Walk-in record saved successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.post('/save', OptionalMiddilWare, saveWalkin);

/**
 * @swagger
 * /api/walkin/list:
 *   get:
 *     tags: [Walkin]
 *     summary: Retrieve walk-ins with role-based restrictions (Used by Web Dashboard)
 *     description: >
 *       **Where to use:** Used by the Web Application Dashboard (Walkin List / Walkin Reports pages).
 *       
 *       **What it does:** Fetches walk-in logs filtered dynamically by the logged-in admin's allowed branches and optional date range parameters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Lower boundary date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Upper boundary date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Walk-ins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 15
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/list', MiddilWare, getWalkins);

/**
 * @swagger
 * /api/walkin/all:
 *   get:
 *     tags: [Walkin]
 *     summary: Retrieve ALL walk-ins globally (Used by External Webpages)
 *     description: >
 *       **Where to use:** Used by external websites or services that need to pull the full list of Walk-in leads.
 *       
 *       **What it does:** Fetches the entire collection of Walk-ins without requiring any admin authentication or role-based restrictions.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Lower boundary date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Upper boundary date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Walk-ins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 100
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/all', getAllWalkinsPublic);

/**
 * GET /api/walkin/cron-logs
 * Returns cron job run history — use ?jobType=walkin_status_sync or ?jobType=walkin_loss_expiry to filter
 * Use ?limit=N to control how many records to return (max 100, default 20)
 */
router.get('/cron-logs', MiddilWare, getCronLogs);

export default router;
