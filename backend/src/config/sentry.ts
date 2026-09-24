import { minimizeSentryEvent } from '../utils/privacy-log.util';
// apps/backend/src/config/sentry.ts

import * as Sentry from '@sentry/node';
import { env } from './env';

/**
 * Initialize Sentry error monitoring.
 * Must be called before any other imports in server.ts.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      Sentry.expressIntegration(),
    ],
    sendDefaultPii: false,
    beforeSend: minimizeSentryEvent,
    // Capture 100% of transactions in development, 10% in production
    tracesSampleRate: 0,
  });
}

export { Sentry };
