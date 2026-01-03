// apps/backend/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export const Errors = {
  NotFound: (resource: string = 'Recurso') => 
    new AppError(`${resource} não encontrado`, 404, 'NOT_FOUND'),
  
  BadRequest: (message: string = 'Requisição inválida') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  Unauthorized: (message: string = 'Não autorizado') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  Forbidden: (message: string = 'Acesso negado') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  Conflict: (message: string = 'Conflito') => 
    new AppError(message, 409, 'CONFLICT'),
  
  ValidationError: (message: string) => 
    new AppError(message, 422, 'VALIDATION_ERROR'),
  
  InternalError: (message: string = 'Erro interno do servidor') => 
    new AppError(message, 500, 'INTERNAL_ERROR', false),
};

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.path} não encontrada`,
    code: 'ROUTE_NOT_FOUND',
  });
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: env.isDevelopment ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle known AppError
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(env.isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: 'Registro duplicado',
          code: 'DUPLICATE_ENTRY',
        });
        return;
      
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Registro não encontrado',
          code: 'NOT_FOUND',
        });
        return;
      
      default:
        break;
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      message: error.message,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: env.isProduction 
      ? 'Erro interno do servidor' 
      : error.message,
    code: 'INTERNAL_ERROR',
    ...(env.isDevelopment && { stack: error.stack }),
  });
}
