// apps/backend/src/modules/testimonials/testimonials.routes.ts

import { Router } from 'express';
import { testimonialsController } from './testimonials.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get(
  '/testimonials',
  testimonialsController.findPublic.bind(testimonialsController)
);

router.get(
  '/testimonials/featured',
  testimonialsController.findFeatured.bind(testimonialsController)
);

// Client routes
router.post(
  '/testimonials',
  authenticate,
  testimonialsController.create.bind(testimonialsController)
);

// Admin routes
router.get(
  '/admin/testimonials',
  authenticate,
  requireAdmin,
  testimonialsController.findAll.bind(testimonialsController)
);

router.get(
  '/admin/testimonials/stats',
  authenticate,
  requireAdmin,
  testimonialsController.getStats.bind(testimonialsController)
);

router.patch(
  '/admin/testimonials/:id',
  authenticate,
  requireAdmin,
  testimonialsController.update.bind(testimonialsController)
);

router.delete(
  '/admin/testimonials/:id',
  authenticate,
  requireAdmin,
  testimonialsController.delete.bind(testimonialsController)
);

export default router;
