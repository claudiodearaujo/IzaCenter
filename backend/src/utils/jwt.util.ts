import jwt, { SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { JwtPayload } from '../types';

const issuer = 'therapist-platform';
const audience = 'therapist-api';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
type Principal = { id: string; email: string; role: 'CLIENT' | 'ADMIN'; authVersion?: number };

export function generateAccessToken(user: Principal, sid: string): string {
  return jwt.sign({ sub: user.id, sid, email: user.email, role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256', issuer, audience, expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer, audience });
  if (typeof payload === 'string' || typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' || typeof payload.exp !== 'number') {
    throw new Error('Invalid access claims');
  }
  return payload as JwtPayload;
}

// Opaque refresh credential. Only its SHA-256 digest is persisted.
export function generateRefreshToken(sid: string): string {
  return `${sid}.${randomBytes(32).toString('hex')}`;
}

export async function generateTokenPair(user: Principal) {
  const sid = randomUUID();
  const refreshToken = generateRefreshToken(sid);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86400000);
  await prisma.authSession.create({ data: {
    id: sid, userId: user.id, authVersion: user.authVersion ?? 0,
    refreshHash: digest(refreshToken), expiresAt,
  } });
  return { accessToken: generateAccessToken(user, sid), refreshToken };
}

export async function verifyRefreshToken(token: string) {
  if (!/^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token)) throw new Error('Invalid refresh');
  const sid = token.split('.')[0];
  const session = await prisma.authSession.findUnique({ where: { id: sid }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() ||
      session.authVersion !== session.user.authVersion) throw new Error('Inactive session');
  if (session.refreshHash !== digest(token)) {
    // A valid session ID alone must not let an attacker revoke a session.
    throw new Error('Invalid refresh');
  }
  return { sub: session.userId, sid, session };
}

export async function rotateRefreshToken(token: string, tenantId: string) {
  const decoded = await verifyRefreshToken(token);
  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId: decoded.sub } }, select: { isActive: true },
  });
  if (!membership?.isActive) throw new Error('Inactive membership');
  const refreshToken = generateRefreshToken(decoded.sid);
  // Compare-and-swap allows exactly one concurrent refresh. A loser gets 401;
  // it does not revoke the winner or extend the absolute session expiration.
  const changed = await prisma.authSession.updateMany({ where: {
    id: decoded.sid, refreshHash: digest(token), revokedAt: null, expiresAt: { gt: new Date() },
  }, data: { refreshHash: digest(refreshToken) } });
  if (changed.count !== 1) throw new Error('Refresh already consumed');
  return { accessToken: generateAccessToken(decoded.session.user, decoded.sid), refreshToken };
}

export async function assertActiveSession(payload: JwtPayload): Promise<void> {
  const session = await prisma.authSession.findUnique({ where: { id: payload.sid }, include: { user: true } });
  if (!session || session.userId !== payload.sub || session.revokedAt ||
      session.expiresAt <= new Date() || session.authVersion !== session.user.authVersion) {
    throw new Error('Inactive session');
  }
}

export async function revokeAccessSession(token: string) {
  const payload = verifyAccessToken(token);
  await prisma.authSession.updateMany({ where: { id: payload.sid, userId: payload.sub }, data: { revokedAt: new Date() } });
}
