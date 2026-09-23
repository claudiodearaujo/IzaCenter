export const environment = {
  production: true,
  // Same-origin API. Nginx/Coolify proxies /api to the backend container.
  apiUrl: '/api',
  stripePublishableKey: 'pk_test_local',
  sentryDsn: ''
};
