import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (environment.sentryDsn && environment.sentryDsn.trim()) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.production ? 'production' : 'development',
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      event.request = undefined;
      event.user = undefined;
      event.breadcrumbs = undefined;
      event.extra = undefined;
      event.transaction = undefined;
      if (event.message) event.message = 'Application error';
      event.exception?.values?.forEach(value => { value.value = 'Error details omitted'; });
      return event;
    },
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
