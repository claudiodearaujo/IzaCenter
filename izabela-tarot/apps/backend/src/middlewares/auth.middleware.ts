// apps/backend/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { prisma } from '../config/database';

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
      
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores',
    });
    return;
  }
  next();
}

/**
 * Middleware to require client role
 */
export function requireClient(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'CLIENT') {
    res.status(403).json({
      success: false,
      message: 'Acesso restrito a clientes',
    });
    return;
  }
  next();
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } catch {
      // Ignore token errors in optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}
