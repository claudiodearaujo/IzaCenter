// apps/backend/src/modules/readings/readings.routes.ts

import { Router } from 'express';
import { readingsController } from './readings.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Client routes
router.get(
  '/readings',
  authenticate,
  readingsController.findByUser.bind(readingsController)
);

router.get(
  '/readings/:id',
  authenticate,
  readingsController.findByIdForUser.bind(readingsController)
);

// Admin routes
router.get(
  '/admin/readings',
  authenticate,
  requireAdmin,
  readingsController.findAll.bind(readingsController)
);

router.get(
  '/admin/readings/stats',
  authenticate,
  requireAdmin,
  readingsController.getStats.bind(readingsController)
);

router.get(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.findById.bind(readingsController)
);

router.put(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.update.bind(readingsController)
);

router.patch(
  '/admin/readings/:id/status',
  authenticate,
  requireAdmin,
  readingsController.updateStatus.bind(readingsController)
);

router.patch(
  '/admin/readings/:id/audio',
  authenticate,
  requireAdmin,
  readingsController.updateAudio.bind(readingsController)
);

router.delete(
  '/admin/readings/:id',
  authenticate,
  requireAdmin,
  readingsController.delete.bind(readingsController)
);

export default router;
