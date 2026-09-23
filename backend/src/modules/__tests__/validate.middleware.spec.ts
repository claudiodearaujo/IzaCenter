import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

describe('validate middleware with Express 5 request getters', () => {
  it('should replace a read-only req.query getter with validated query data', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    Object.defineProperty(req, 'query', {
      get: () => ({ page: '2' }),
      configurable: true,
      enumerable: true,
    });

    const middleware = validate(
      z.object({
        page: z.coerce.number().int().positive().default(1),
      }),
      'query'
    );

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ page: 2 });
  });
});
