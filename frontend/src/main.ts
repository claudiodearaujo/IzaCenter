import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (environment.sentryDsn && environment.sentryDsn.trim()) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.production ? 'production' : 'development',
    tracesSampleRate: environment.production ? 0.1 : 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
