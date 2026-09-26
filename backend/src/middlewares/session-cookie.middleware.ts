import { Request, Response, NextFunction } from 'express';
import { env, getAllowedFrontendOrigins } from '../config/env';

export const REFRESH_COOKIE = 'therapist_refresh';
const cookieOptions = () => ({
  httpOnly: true, secure: env.isProduction, sameSite: 'strict' as const,
  path: env.API_PREFIX || '/api', maxAge: env.SESSION_TTL_DAYS * 86400000,
});

export function sessionResponse<T extends { refreshToken: string }>(res: Response, result: T) {
  const { refreshToken, ...publicResult } = result;
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.setHeader('Cache-Control', 'no-store');
  return publicResult;
}

export function clearSessionCookie(res: Response) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(REFRESH_COOKIE, options);
}

// Browser cookie mutations require a non-simple header AND an allowed origin.
// Header-only callers without Origin are permitted (CLI); browsers cannot forge Origin.
export function protectSession(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowed = getAllowedFrontendOrigins();
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest' ||
      (origin && !allowed.includes(origin)) || req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({ success: false, code: 'CSRF_REJECTED', message: 'Origem não autorizada' });
    return;
  }
  next();
}
