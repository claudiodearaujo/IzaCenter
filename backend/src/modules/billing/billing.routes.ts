import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { billingController } from './billing.controller';
import { createSaasCheckoutSchema } from './billing.schema';

const router = Router();

router.get('/billing/plans', billingController.getPlans.bind(billingController));

router.get(
  '/billing/current',
  authenticate,
  requireAdmin,
  billingController.getCurrent.bind(billingController)
);

router.post(
  '/billing/checkout',
  authenticate,
  requireAdmin,
  validate(createSaasCheckoutSchema),
  billingController.createCheckout.bind(billingController)
);

router.post(
  '/billing/portal',
  authenticate,
  requireAdmin,
  billingController.createPortal.bind(billingController)
);

export default router;
