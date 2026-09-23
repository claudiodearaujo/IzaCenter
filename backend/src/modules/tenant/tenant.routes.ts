import { Router } from 'express';
import { tenantController } from './tenant.controller';

const router = Router();

/**
 * @openapi
 * /tenant/current:
 *   get:
 *     tags: [Tenant]
 *     summary: Get the tenant resolved for the current request
 *     security: []
 *     responses:
 *       200:
 *         description: Current tenant context
 *       404:
 *         description: Tenant not found or inactive
 */
router.get('/tenant/current', tenantController.getCurrent.bind(tenantController));

export default router;
