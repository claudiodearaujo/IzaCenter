// apps/backend/src/middlewares/index.ts

export { authenticate, requireAdmin, requireClient, optionalAuth } from './auth.middleware';
export { AppError, Errors, notFoundHandler, errorHandler } from './error.middleware';
export { validate, commonSchemas, idParamsSchema, paginationQuerySchema } from './validate.middleware';
export { uploadImage, uploadDocument, uploadAudio, uploadVideo, uploadFile, generateFileName, getUploadFolder } from './upload.middleware';
export { generalLimiter, authLimiter, passwordResetLimiter, uploadLimiter } from './rateLimiter.middleware';
