import { NextFunction, Request, Response } from 'express';
import { settingsService } from '../modules/settings/settings.service';

export function requireSpecialtyModule(moduleKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const enabled = await settingsService.isSpecialtyModuleEnabled(moduleKey);

      if (!enabled) {
        res.status(404).json({
          success: false,
          message: 'Módulo de especialidade não habilitado',
          code: 'SPECIALTY_MODULE_DISABLED',
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
