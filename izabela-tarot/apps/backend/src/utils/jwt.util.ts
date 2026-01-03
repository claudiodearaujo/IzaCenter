// apps/backend/src/utils/jwt.util.ts

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

/**
 * Generate access token
 */
export function generateAccessToken(payload: {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
}): string {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}

/**
 * Generate token pair (access + refresh)
 */
export function generateTokenPair(payload: {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
}): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.id),
  };
}
