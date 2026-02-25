// apps/backend/src/modules/appointments/appointments.routes.ts

import { Router } from 'express';
import { appointmentsController } from './appointments.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /appointments/available-slots:
 *   get:
 *     tags: [Appointments]
 *     summary: Get available appointment slots
 *     security: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check available slots (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "09:00"
 */
router.get(
  '/appointments/available-slots',
  appointmentsController.getAvailableSlots.bind(appointmentsController)
);

/**
 * @openapi
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: List client's appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments for the authenticated client
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get(
  '/appointments',
  authenticate,
  appointmentsController.findByUser.bind(appointmentsController)
);

/**
 * @openapi
 * /appointments/{id}/cancel:
 *   post:
 *     tags: [Appointments]
 *     summary: Cancel an appointment (client)
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
 *         description: Appointment cancelled
 *       400:
 *         description: Cannot cancel — appointment already completed or time window passed
 */
router.post(
  '/appointments/:id/cancel',
  authenticate,
  appointmentsController.cancel.bind(appointmentsController)
);

/**
 * @openapi
 * /admin/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: List all appointments (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
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
 *         description: Paginated list of all appointments
 */
router.get(
  '/admin/appointments',
  authenticate,
  requireAdmin,
  appointmentsController.findAll.bind(appointmentsController)
);

/**
 * @openapi
 * /admin/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID (admin)
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
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */
router.get(
  '/admin/appointments/:id',
  authenticate,
  requireAdmin,
  appointmentsController.findById.bind(appointmentsController)
);

/**
 * @openapi
 * /admin/appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment status (admin)
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
 *                 enum: [CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/admin/appointments/:id/status',
  authenticate,
  requireAdmin,
  appointmentsController.updateStatus.bind(appointmentsController)
);

/**
 * @openapi
 * /admin/appointments/{id}/reschedule:
 *   patch:
 *     tags: [Appointments]
 *     summary: Reschedule an appointment (admin)
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
 *             required: [scheduledAt]
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Appointment rescheduled
 */
router.patch(
  '/admin/appointments/:id/reschedule',
  authenticate,
  requireAdmin,
  appointmentsController.reschedule.bind(appointmentsController)
);

/**
 * @openapi
 * /admin/appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment details (admin)
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
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated
 */
router.patch(
  '/admin/appointments/:id',
  authenticate,
  requireAdmin,
  appointmentsController.update.bind(appointmentsController)
);

export default router;
