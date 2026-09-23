import { Router } from 'express';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { onboardingController } from './onboarding.controller';
import { professionalOnboardingSchema } from './onboarding.schema';

const router = Router();

router.post(
  '/onboarding/professional',
  authLimiter,
  validate(professionalOnboardingSchema),
  onboardingController.professional.bind(onboardingController)
);

export default router;
