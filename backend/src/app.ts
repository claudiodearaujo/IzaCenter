// apps/backend/src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { Sentry } from './config/sentry';
import { notFoundHandler, errorHandler, generalLimiter } from './middlewares';
import { auditLogger } from './middlewares/audit.middleware';
import { swaggerSpec } from './config/swagger';
import {
  authRoutes,
  usersRoutes,
  productsRoutes,
  ordersRoutes,
  stripeWebhook,
  readingsRoutes,
  cardsRoutes,
  appointmentsRoutes,
  categoriesRoutes,
  testimonialsRoutes,
  settingsRoutes,
  dashboardRoutes,
  notificationsRoutes,
  contactRoutes,
} from './modules';

// Create Express app
const app: Application = express();

// =============================================
// SECURITY MIDDLEWARES
// =============================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: env.isDevelopment 
    ? ['http://localhost:4200', 'http://127.0.0.1:4200']
    : [env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// =============================================
// WEBHOOKS (before body parsing)
// =============================================

// Stripe webhook needs raw body
app.use('/webhooks/stripe', stripeWebhook);

// =============================================
// BODY PARSING
// =============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// =============================================
// UTILITY MIDDLEWARES
// =============================================

// Compression
app.use(compression());

// Logging
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Audit logging for sensitive operations
app.use(auditLogger);

// =============================================
// HEALTH CHECK
// =============================================

app.get('/health', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Database check
  try {
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Redis check
  try {
    const { getRedisClient } = await import('./config/redis');
    const client = await getRedisClient();
    if (client.isOpen) {
      checks.redis = 'ok';
    } else {
      checks.redis = 'disconnected';
    }
  } catch {
    checks.redis = 'unavailable';
  }

  const allHealthy = Object.values(checks).every(v => v === 'ok' || v === 'unavailable');
  const status = allHealthy ? 'ok' : 'degraded';

  res.status(allHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  });
});

// =============================================
// API ROUTES
// =============================================

const apiPrefix = env.API_PREFIX;
// v1 prefix provides versioned access alongside the default prefix
const apiV1Prefix = `${apiPrefix}/v1`;

function mountRoutes(prefix: string) {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, usersRoutes);
  app.use(`${prefix}/products`, productsRoutes);
  app.use(`${prefix}/orders`, ordersRoutes);
  app.use(`${prefix}/notifications`, notificationsRoutes);
  app.use(prefix, readingsRoutes);
  app.use(prefix, cardsRoutes);
  app.use(prefix, appointmentsRoutes);
  app.use(prefix, categoriesRoutes);
  app.use(prefix, testimonialsRoutes);
  app.use(prefix, settingsRoutes);
  app.use(prefix, dashboardRoutes);
  app.use(prefix, contactRoutes);
}

// Mount on both /api and /api/v1 for backward compatibility + versioning
mountRoutes(apiPrefix);
mountRoutes(apiV1Prefix);

// =============================================
// API DOCUMENTATION
// =============================================

// Swagger UI — served in all environments for discoverability
app.use(
  `${apiPrefix}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'IzaCenter API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

// OpenAPI spec endpoint (JSON)
app.get(`${apiPrefix}/docs.json`, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

if (env.isDevelopment) {
  app.get(`${apiPrefix}`, (req: Request, res: Response) => {
    res.json({
      message: 'Izabela Tarot API',
      version: '1.0.0',
      documentation: `${apiPrefix}/docs`,
      openApiSpec: `${apiPrefix}/docs.json`,
      versioned: {
        v1: `${apiV1Prefix}`,
        latest: `${apiPrefix}`,
      },
      endpoints: {
        auth: `${apiPrefix}/auth`,
        users: `${apiPrefix}/users`,
        products: `${apiPrefix}/products`,
        orders: `${apiPrefix}/orders`,
        notifications: `${apiPrefix}/notifications`,
        readings: `${apiPrefix}/readings`,
        cards: `${apiPrefix}/cards`,
        appointments: `${apiPrefix}/appointments`,
        categories: `${apiPrefix}/categories`,
        testimonials: `${apiPrefix}/testimonials`,
        settings: `${apiPrefix}/settings`,
        admin: {
          dashboard: `${apiPrefix}/admin/dashboard`,
          readings: `${apiPrefix}/admin/readings`,
          cards: `${apiPrefix}/admin/cards`,
          appointments: `${apiPrefix}/admin/appointments`,
          categories: `${apiPrefix}/admin/categories`,
          testimonials: `${apiPrefix}/admin/testimonials`,
          settings: `${apiPrefix}/admin/settings`,
        },
      },
    });
  });
}

// =============================================
// ERROR HANDLING
// =============================================

// Sentry error handler (must be before custom error handler)
Sentry.setupExpressErrorHandler(app);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
