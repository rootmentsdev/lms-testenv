// routes/TrainingRoutes.js
import express from 'express';
import { migrateFoundationOfServiceTraining } from '../controllers/TrainingController.js';
import { MiddilWare } from '../lib/middilWare.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                         🔖 Swagger / OpenAPI Docs                          */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * tags:
 *   name: AdminMigration
 *   description: Admin-only endpoints that handle one-off data migrations
 */

/**
 * @swagger
 * /api/admin/migrate/foundationTraining:
 *   post:
 *     summary: Migrate “Foundation of Service” progress
 *     description: |
 *       Moves each user’s **Completed** record for *Foundation of Service* \
 *       from the **Assigned** section to **Mandatory**, merges data if a \
 *       Mandatory entry already exists, and deletes the old Assigned record. \
 *       The operation is **idempotent** and runs inside a MongoDB transaction.
 *     tags: [AdminMigration]
 *     security:
 *       - bearerAuth: []          # 👈 matches the scheme you defined in swagger.js
 *     responses:
 *       200:
 *         description: Migration finished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Migration finished successfully 🎉
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  '/migrate/foundationTraining',
  MiddilWare,                          // 🔒 remove or replace if you don't want auth
  migrateFoundationOfServiceTraining
);

export default router;
