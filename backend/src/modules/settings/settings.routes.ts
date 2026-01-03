// apps/backend/src/modules/settings/settings.routes.ts

import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/settings/public', settingsController.getPublic.bind(settingsController));

// Admin routes
router.get(
  '/admin/settings',
  authenticate,
  requireAdmin,
  settingsController.getAll.bind(settingsController)
);

// General settings
router.get(
  '/admin/settings/general',
  authenticate,
  requireAdmin,
  settingsController.getGeneral.bind(settingsController)
);

router.put(
  '/admin/settings/general',
  authenticate,
  requireAdmin,
  settingsController.updateGeneral.bind(settingsController)
);

// Contact settings
router.get(
  '/admin/settings/contact',
  authenticate,
  requireAdmin,
  settingsController.getContact.bind(settingsController)
);

router.put(
  '/admin/settings/contact',
  authenticate,
  requireAdmin,
  settingsController.updateContact.bind(settingsController)
);

// Business hours
router.get(
  '/admin/settings/business-hours',
  authenticate,
  requireAdmin,
  settingsController.getBusinessHours.bind(settingsController)
);

router.put(
  '/admin/settings/business-hours',
  authenticate,
  requireAdmin,
  settingsController.updateBusinessHours.bind(settingsController)
);

// Content settings
router.get(
  '/admin/settings/content',
  authenticate,
  requireAdmin,
  settingsController.getContent.bind(settingsController)
);

router.put(
  '/admin/settings/content',
  authenticate,
  requireAdmin,
  settingsController.updateContent.bind(settingsController)
);

// Analytics settings
router.get(
  '/admin/settings/analytics',
  authenticate,
  requireAdmin,
  settingsController.getAnalytics.bind(settingsController)
);

router.put(
  '/admin/settings/analytics',
  authenticate,
  requireAdmin,
  settingsController.updateAnalytics.bind(settingsController)
);

export default router;
