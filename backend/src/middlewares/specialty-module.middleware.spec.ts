jest.mock('../modules/settings/settings.service', () => ({
  settingsService: {
    isSpecialtyModuleEnabled: jest.fn(),
  },
}));

import { NextFunction, Request, Response } from 'express';
import { requireSpecialtyModule } from './specialty-module.middleware';
import { settingsService } from '../modules/settings/settings.service';

describe('requireSpecialtyModule', () => {
  const moduleEnabled = settingsService.isSpecialtyModuleEnabled as jest.Mock;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    moduleEnabled.mockReset();
  });

  it('should continue when the specialty module is enabled', async () => {
    moduleEnabled.mockResolvedValue(true);

    await requireSpecialtyModule('tarot-cards')(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should hide disabled specialty modules with 404', async () => {
    moduleEnabled.mockResolvedValue(false);

    await requireSpecialtyModule('tarot-cards')(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'SPECIALTY_MODULE_DISABLED',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should forward registry errors', async () => {
    const error = new Error('settings unavailable');
    moduleEnabled.mockRejectedValue(error);

    await requireSpecialtyModule('tarot-cards')(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
