// apps/backend/src/config/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Therapist Platform — Therapist Platform API',
      version: '1.0.0',
      description:
        'REST API for the Therapist Platform platform — Tarot readings, appointments, e-commerce and admin management.',
      contact: {
        name: 'Therapist Platform',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Common
        ApiResponse: {
          type: 'object',
          properties: {
            data: { type: 'object' },
          },
        },
        PaginatedMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        // Auth
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123!' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            fullName: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
          },
        },
        // User
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            role: { type: 'string', enum: ['CLIENT', 'ADMIN'] },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Product
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            shortDescription: { type: 'string', nullable: true },
            fullDescription: { type: 'string', nullable: true },
            productType: {
              type: 'string',
              enum: ['QUESTION', 'SESSION', 'MONTHLY', 'SPECIAL'],
              deprecated: true,
              description: 'Legacy compatibility field. Prefer serviceKind + capabilities.',
            },
            serviceKind: {
              type: 'string',
              example: 'SESSION',
              description: 'Open service classification. Not a database enum.',
            },
            capabilities: {
              type: 'object',
              additionalProperties: true,
              description: 'Composable service capabilities such as scheduling, intake, digitalDelivery and recurring.',
            },
            price: { type: 'number', format: 'float' },
            originalPrice: { type: 'number', format: 'float', nullable: true },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            coverImageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Order
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderNumber: { type: 'string' },
            total: { type: 'number', format: 'float' },
            subtotal: { type: 'number', format: 'float' },
            discount: { type: 'number', format: 'float' },
            status: {
              type: 'string',
              enum: ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
            },
            paymentStatus: {
              type: 'string',
              enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Delivery Domain v3
        Delivery: {
          type: 'object',
          description: 'Generic digital delivery attached to an order item.',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderItemId: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'PUBLISHED', 'ARCHIVED'],
            },
            deliveryType: {
              type: 'string',
              example: 'PDF',
              description: 'Open delivery classification such as CONTENT, PDF, AUDIO or VIDEO.',
            },
            content: {
              type: 'object',
              additionalProperties: true,
              description: 'Generic versioned delivery content.',
            },
            specialtyModule: {
              type: 'object',
              nullable: true,
              additionalProperties: true,
              description: 'Optional specialty-specific module snapshot, e.g. tarot-cards.',
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
            },
            audioUrl: { type: 'string', nullable: true },
            videoUrl: { type: 'string', nullable: true },
            pdfUrl: { type: 'string', nullable: true },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Reading: {
          allOf: [{ $ref: '#/components/schemas/Delivery' }],
          description: 'Legacy compatibility alias for Delivery. Prefer the Delivery schema and /deliveries routes.',
        },
        // Appointment
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            scheduledAt: { type: 'string', format: 'date-time' },
            durationMinutes: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Testimonial
        Testimonial: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientName: { type: 'string' },
            content: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            isApproved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Category
        ProductCategory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        // Coupon
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
            discountValue: { type: 'number', format: 'float' },
            isActive: { type: 'boolean' },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        // Error
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product catalog management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Readings', description: 'Tarot reading sessions' },
      { name: 'Appointments', description: 'Appointment scheduling' },
      { name: 'Categories', description: 'Product category management' },
      { name: 'Testimonials', description: 'Client testimonials' },
      { name: 'Users', description: 'User management' },
      { name: 'Dashboard', description: 'Admin dashboard statistics' },
      { name: 'Settings', description: 'Site configuration' },
      { name: 'Webhooks', description: 'Payment webhooks (Stripe)' },
    ],
  },
  apis: ['./src/modules/**/*.ts', './src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
