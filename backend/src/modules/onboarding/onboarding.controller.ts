import { NextFunction, Request, Response } from 'express';
import { ProfessionalOnboardingDto } from './onboarding.schema';
import { onboardingService } from './onboarding.service';

export class OnboardingController {
  async professional(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await onboardingService.onboardProfessional(
        req.body as ProfessionalOnboardingDto
      );

      res.status(201).json({
        success: true,
        message: 'Workspace criado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const onboardingController = new OnboardingController();
