import { safeLogPath } from '../utils/privacy-log.util';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { auditService } from '../modules/privacy/audit.service';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function shouldAudit(req: Request): boolean {
  if (WRITE_METHODS.has(req.method)) return true;
  return req.method === 'GET' && req.path === '/privacy/export';
}

function actionFor(req: Request): string {
  const path = safeLogPath(req.path)
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,36}(?=\/|$)/gi, '/:id')
    .replace(/\/+$/, '');

  const known: Array<[RegExp, string]> = [
    [/^\/auth\/login$/, 'auth.login'],
    [/^\/auth\/register$/, 'auth.register'],
    [/^\/auth\/logout$/, 'auth.logout'],
    [/^\/auth\/reset-password$/, 'auth.reset_password'],
    [/^\/privacy\/export$/, 'privacy.export'],
    [/^\/privacy\/requests$/, 'privacy.request'],
    [/^\/admin\/privacy\/requests/, 'privacy.admin_request'],
    [/^\/admin\/privacy\/incidents/, 'privacy.incident'],
    [/^\/admin\/privacy\/retention/, 'privacy.retention'],
    [/^\/billing\//, 'billing'],
    [/^\/orders/, 'orders'],
    [/^\/settings|^\/admin\/settings/, 'settings'],
  ];

  return known.find(([pattern]) => pattern.test(path))?.[1] ||
    `http.${path || '/'}`;
}

export function auditLogger(req: Request, res: Response, next: NextFunction): void {
  if (!shouldAudit(req)) {
    next();
    return;
  }

  const auditRequestId = randomUUID();
  (req as any).auditRequestId = auditRequestId;
  res.setHeader('X-Request-Id', auditRequestId);

  res.once('finish', () => {
    const user = (req as any).user;
    const tenant = (req as any).tenant;
    const tenantId = req.path.startsWith('/onboarding') ? null : tenant?.id || null;

    void auditService.record({
      tenantId,
      actorUserId: user?.id || null,
      action: actionFor(req),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      outcome: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
      requestId: auditRequestId,
      ip: req.ip || req.socket.remoteAddress || null,
    }).catch((error) => {
      console.error('[AUDIT_PERSISTENCE_ERROR]', {
        requestId: auditRequestId,
        action: actionFor(req),

      });
    });
  });

  next();
}
