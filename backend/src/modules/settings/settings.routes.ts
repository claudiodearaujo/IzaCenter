// apps/backend/src/modules/settings/settings.routes.ts

import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /settings/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public site settings
 *     security: []
 *     responses:
 *       200:
 *         description: Public settings (site name, logo, enabled features)
 */
router.get('/settings/public', settingsController.getPublic.bind(settingsController));

/**
 * @openapi
 * /admin/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get all settings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings sections
 */
router.get(
  '/admin/settings',
  authenticate,
  requireAdmin,
  settingsController.getAll.bind(settingsController)
);

/**
 * @openapi
 * /admin/settings/general:
 *   get:
 *     tags: [Settings]
 *     summary: Get general settings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: General settings
 *   put:
 *     tags: [Settings]
 *     summary: Update general settings (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
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

/**
 * @openapi
 * /admin/settings/contact:
 *   get:
 *     tags: [Settings]
 *     summary: Get contact settings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact settings
 *   put:
 *     tags: [Settings]
 *     summary: Update contact settings (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
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

/**
 * @openapi
 * /admin/settings/business-hours:
 *   get:
 *     tags: [Settings]
 *     summary: Get business hours configuration (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business hours per weekday
 *   put:
 *     tags: [Settings]
 *     summary: Update business hours (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 isOpen:
 *                   type: boolean
 *                 start:
 *                   type: string
 *                   example: "09:00"
 *                 end:
 *                   type: string
 *                   example: "18:00"
 *     responses:
 *       200:
 *         description: Business hours updated
 */
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

/**
 * @openapi
 * /admin/settings/content:
 *   get:
 *     tags: [Settings]
 *     summary: Get content settings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Content settings (hero text, about, etc.)
 *   put:
 *     tags: [Settings]
 *     summary: Update content settings (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
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

/**
 * @openapi
 * /admin/settings/analytics:
 *   get:
 *     tags: [Settings]
 *     summary: Get analytics settings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics settings
 *   put:
 *     tags: [Settings]
 *     summary: Update analytics settings (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
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
