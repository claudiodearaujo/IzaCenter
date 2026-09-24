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
    beforeSend(event) {
      if (event.request) {
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['set-cookie'];
          delete event.request.headers['x-api-key'];
        }
        event.request.data = undefined;
        event.request.cookies = undefined;
      }
      return event;
    },
    // Capture 100% of transactions in development, 10% in production
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
  });
}

export { Sentry };
