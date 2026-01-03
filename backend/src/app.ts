// apps/backend/src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env';
import { notFoundHandler, errorHandler, generalLimiter } from './middlewares';
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

// =============================================
// UTILITY MIDDLEWARES
// =============================================

// Compression
app.use(compression());

// Logging (only in development)
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(generalLimiter);

// =============================================
// HEALTH CHECK
// =============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// =============================================
// API ROUTES
// =============================================

const apiPrefix = env.API_PREFIX;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/products`, productsRoutes);
app.use(`${apiPrefix}/orders`, ordersRoutes);
app.use(apiPrefix, readingsRoutes);
app.use(apiPrefix, cardsRoutes);
app.use(apiPrefix, appointmentsRoutes);
app.use(apiPrefix, categoriesRoutes);
app.use(apiPrefix, testimonialsRoutes);
app.use(apiPrefix, settingsRoutes);
app.use(apiPrefix, dashboardRoutes);

// =============================================
// API DOCUMENTATION (Development only)
// =============================================

if (env.isDevelopment) {
  app.get(`${apiPrefix}`, (req: Request, res: Response) => {
    res.json({
      message: 'Izabela Tarot API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        auth: `${apiPrefix}/auth`,
        users: `${apiPrefix}/users`,
        products: `${apiPrefix}/products`,
        orders: `${apiPrefix}/orders`,
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

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
