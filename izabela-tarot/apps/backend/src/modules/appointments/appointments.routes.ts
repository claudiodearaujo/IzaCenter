// apps/backend/src/modules/appointments/appointments.routes.ts

import { Router } from 'express';
import { appointmentsController } from './appointments.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get(
  '/appointments/available-slots',
  appointmentsController.getAvailableSlots.bind(appointmentsController)
);

// Client routes
router.get(
  '/appointments',
  authenticate,
  appointmentsController.findByUser.bind(appointmentsController)
);

router.post(
  '/appointments/:id/cancel',
  authenticate,
  appointmentsController.cancel.bind(appointmentsController)
);

// Admin routes
router.get(
  '/admin/appointments',
  authenticate,
  requireAdmin,
  appointmentsController.findAll.bind(appointmentsController)
);

router.get(
  '/admin/appointments/:id',
  authenticate,
  requireAdmin,
  appointmentsController.findById.bind(appointmentsController)
);

router.patch(
  '/admin/appointments/:id/status',
  authenticate,
  requireAdmin,
  appointmentsController.updateStatus.bind(appointmentsController)
);

router.patch(
  '/admin/appointments/:id/reschedule',
  authenticate,
  requireAdmin,
  appointmentsController.reschedule.bind(appointmentsController)
);

router.patch(
  '/admin/appointments/:id',
  authenticate,
  requireAdmin,
  appointmentsController.update.bind(appointmentsController)
);

export default router;
