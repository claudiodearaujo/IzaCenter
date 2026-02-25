// apps/backend/src/middlewares/audit.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface AuditEntry {
  timestamp: string;
  action: string;
  method: string;
  path: string;
  userId?: string;
  userEmail?: string;
  ip: string;
  statusCode?: number;
  duration?: number;
}

/**
 * Sensitive paths that should be audit-logged
 */
const SENSITIVE_PATTERNS = [
  { pattern: /^\/api\/auth\/login$/, action: 'auth.login' },
  { pattern: /^\/api\/auth\/register$/, action: 'auth.register' },
  { pattern: /^\/api\/auth\/logout$/, action: 'auth.logout' },
  { pattern: /^\/api\/auth\/reset-password$/, action: 'auth.resetPassword' },
  { pattern: /^\/api\/orders/, action: 'orders' },
  { pattern: /^\/api\/admin\//, action: 'admin' },
  { pattern: /^\/webhooks\/stripe/, action: 'webhook.stripe' },
];

/**
 * Audit logging middleware for sensitive operations
 */
export function auditLogger(req: Request, res: Response, next: NextFunction): void {
  const match = SENSITIVE_PATTERNS.find(p => p.pattern.test(req.path));

  if (!match) {
    next();
    return;
  }

  const startTime = Date.now();

  const originalEnd = res.end;
  res.end = function (this: Response, ...args: any[]) {
    const duration = Date.now() - startTime;
    const user = (req as any).user;

    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: match.action,
      method: req.method,
      path: req.path,
      userId: user?.id,
      userEmail: user?.email,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      statusCode: res.statusCode,
      duration,
    };

    // Log to stdout in structured format
    console.log(`[AUDIT] ${JSON.stringify(entry)}`);

    return (originalEnd as Function).apply(this, args);
  } as any;

  next();
}
