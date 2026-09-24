import { validateUploadContent } from '../../middlewares/upload.middleware';
import { uploadLimiter } from '../../middlewares/rateLimiter.middleware';
// apps/backend/src/modules/readings/readings.routes.ts

import { Router } from 'express';
import { readingsController } from './readings.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { uploadAudio as uploadAudioFile } from '../../middlewares/upload.middleware';

const router = Router();

/**
 * @openapi
 * /readings:
 *   get:
 *     tags: [Readings]
 *     summary: Get current client's readings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Legacy alias for the client's digital deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reading'
 */
router.get(
  '/readings',
  authenticate,
  readingsController.findByUser.bind(readingsController)
);

/**
 * @openapi
 * /readings/{id}:
 *   get:
 *     tags: [Readings]
 *     summary: Get a specific reading for the current client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reading details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reading'
 *       403:
 *         description: Access denied — reading belongs to another client
 *       404:
 *         description: Reading not found
 */
router.get(
  '/readings/:id',
  authenticate,
  readingsController.findByIdForUser.bind(readingsController)
);

/**
 * @openapi
 * /readings/{id}/pdf:
 *   get:
 *     tags: [Readings]
 *     summary: Download reading PDF (client)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Reading not yet published
 *       404:
 *         description: Reading not found
 */
router.get(
  '/readings/:id/pdf',
  authenticate,
  readingsController.downloadPdf.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings:
 *   get:
 *     tags: [Readings]
 *     summary: List all readings (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, WAITING, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of readings
 */
router.get(
  '/admin/readings',
  authenticate,
  requireAdmin,
  readingsController.findAll.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/stats:
 *   get:
 *     tags: [Readings]
 *     summary: Get reading statistics (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading statistics (total, by status)
 */
router.get(
  '/admin/readings/stats',
  authenticate,
  requireAdmin,
  readingsController.getStats.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/{id}:
 *   get:
 *     tags: [Readings]
 *     summary: Get a reading by ID (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reading details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reading'
 *       404:
 *         description: Reading not found
 */
router.get(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.findById.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/{id}:
 *   put:
 *     tags: [Readings]
 *     summary: Update a reading (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reading'
 *     responses:
 *       200:
 *         description: Reading updated
 */
router.put(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.update.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/{id}/status:
 *   patch:
 *     tags: [Readings]
 *     summary: Update reading status (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, WAITING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/admin/readings/:id/status',
  authenticate,
  requireAdmin,
  readingsController.updateStatus.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/{id}/audio:
 *   patch:
 *     tags: [Readings]
 *     summary: Update reading audio URL (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [audioUrl]
 *             properties:
 *               audioUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audio URL updated
 */
router.patch(
  '/admin/readings/:id/audio',
  authenticate,
  requireAdmin,
  readingsController.updateAudio.bind(readingsController)
);

router.post(
  '/admin/readings/:id/upload-audio',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadAudioFile.single('file'),
  validateUploadContent('audio'),
  readingsController.uploadAudio.bind(readingsController)
);

/**
 * @openapi
 * /admin/readings/{id}:
 *   delete:
 *     tags: [Readings]
 *     summary: Delete a reading (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reading deleted
 *       404:
 *         description: Reading not found
 */
router.delete(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.delete.bind(readingsController)
);


/**
 * @openapi
 * /deliveries:
 *   get:
 *     tags: [Deliveries]
 *     summary: List current client's digital deliveries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client deliveries
 * /deliveries/{id}:
 *   get:
 *     tags: [Deliveries]
 *     summary: Get a delivery for the current client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Delivery details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 * /admin/deliveries:
 *   get:
 *     tags: [Deliveries]
 *     summary: List deliveries for administration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated deliveries
 * /admin/deliveries/{id}:
 *   put:
 *     tags: [Deliveries]
 *     summary: Update generic delivery content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               deliveryType:
 *                 type: string
 *               content:
 *                 type: object
 *                 additionalProperties: true
 *               specialtyModule:
 *                 type: object
 *                 nullable: true
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Delivery updated
 */

// Delivery Domain v3 — canonical generic routes.
// Legacy /readings routes above remain available during the migration window.
router.get(
  '/deliveries',
  authenticate,
  readingsController.findByUser.bind(readingsController)
);

router.get(
  '/deliveries/:id/pdf',
  authenticate,
  readingsController.downloadPdf.bind(readingsController)
);

router.get(
  '/deliveries/:id',
  authenticate,
  readingsController.findByIdForUser.bind(readingsController)
);

router.get(
  '/admin/deliveries',
  authenticate,
  requireAdmin,
  readingsController.findAll.bind(readingsController)
);

router.get(
  '/admin/deliveries/stats',
  authenticate,
  requireAdmin,
  readingsController.getStats.bind(readingsController)
);

router.get(
  '/admin/deliveries/:id',
  authenticate,
  requireAdmin,
  readingsController.findById.bind(readingsController)
);

router.put(
  '/admin/deliveries/:id',
  authenticate,
  requireAdmin,
  readingsController.update.bind(readingsController)
);

router.patch(
  '/admin/deliveries/:id/status',
  authenticate,
  requireAdmin,
  readingsController.updateStatus.bind(readingsController)
);

router.patch(
  '/admin/deliveries/:id/audio',
  authenticate,
  requireAdmin,
  readingsController.updateAudio.bind(readingsController)
);

router.post(
  '/admin/deliveries/:id/upload-audio',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadAudioFile.single('file'),
  validateUploadContent('audio'),
  readingsController.uploadAudio.bind(readingsController)
);

router.delete(
  '/admin/deliveries/:id',
  authenticate,
  requireAdmin,
  readingsController.delete.bind(readingsController)
);

export default router;
