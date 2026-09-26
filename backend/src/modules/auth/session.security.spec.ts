import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { env } from '../../config/env';
import { generateTokenPair, verifyAccessToken, assertActiveSession, rotateRefreshToken, revokeAccessSession } from '../../utils/jwt.util';
import { protectSession, sessionResponse } from '../../middlewares/session-cookie.middleware';

const user = { id: 'security-user', email: 'synthetic@example.invalid', role: 'CLIENT' as const, authVersion: 0 };
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

describe('session security', () => {
  let row: any;
  beforeEach(() => {
    (prismaMock.authSession.create as jest.Mock).mockImplementation(async ({ data }: any) => {
      row = { ...data, revokedAt: null, user }; return row;
    });
    (prismaMock.authSession.findUnique as jest.Mock).mockImplementation(async () => row);
    (prismaMock.authSession.updateMany as jest.Mock).mockImplementation(async ({ where, data }: any) => {
      if (where.refreshHash && row.refreshHash !== where.refreshHash) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    });
    prismaMock.tenantMembership.findUnique.mockResolvedValue({ isActive: true } as any);
  });
  it('persists a digest only; old refresh is rejected after rotation', async () => {
    const pair = await generateTokenPair(user);
    expect(row.refreshHash).toBe(digest(pair.refreshToken));
    expect(JSON.stringify(row)).not.toContain(pair.refreshToken);
    const rotated = await rotateRefreshToken(pair.refreshToken, 'tenant');
    expect(rotated.refreshToken).not.toBe(pair.refreshToken);
    await expect(rotateRefreshToken(pair.refreshToken, 'tenant')).rejects.toThrow();
    await expect(assertActiveSession(verifyAccessToken(rotated.accessToken))).resolves.toBeUndefined();
  });
  it('revokes access and refresh on logout', async () => {
    const pair = await generateTokenPair(user);
    await revokeAccessSession(pair.accessToken);
    await expect(assertActiveSession(verifyAccessToken(pair.accessToken))).rejects.toThrow();
    await expect(rotateRefreshToken(pair.refreshToken, 'tenant')).rejects.toThrow();
  });
  it('rejects password-version mismatch, expiration and removed sessions', async () => {
    const pair = await generateTokenPair(user);
    row.authVersion = -1;
    await expect(assertActiveSession(verifyAccessToken(pair.accessToken))).rejects.toThrow();
    row.authVersion = 0; row.expiresAt = new Date(0);
    await expect(rotateRefreshToken(pair.refreshToken, 'tenant')).rejects.toThrow();
    row = null;
    await expect(assertActiveSession(verifyAccessToken(pair.accessToken))).rejects.toThrow();
  });
  it('rejects suspended membership without consuming refresh', async () => {
    const pair = await generateTokenPair(user);
    prismaMock.tenantMembership.findUnique.mockResolvedValue({ isActive: false } as any);
    await expect(rotateRefreshToken(pair.refreshToken, 'tenant')).rejects.toThrow();
    expect(row.refreshHash).toBe(digest(pair.refreshToken));
  });
  it('rejects legacy, wrong algorithm, expired and wrong audience JWTs', () => {
    for (const options of [
      { algorithm: 'HS256' as const },
      { algorithm: 'HS384' as const, issuer: 'therapist-platform', audience: 'therapist-api', expiresIn: 60 },
      { algorithm: 'HS256' as const, issuer: 'therapist-platform', audience: 'therapist-api', expiresIn: -1 },
      { algorithm: 'HS256' as const, issuer: 'therapist-platform', audience: 'other', expiresIn: 60 },
    ]) {
      expect(() => verifyAccessToken(jwt.sign({ sub: user.id, sid: 'session' }, env.JWT_SECRET, options))).toThrow();
    }
  });
  it('does not expose refresh in JSON and sets HttpOnly cookie', () => {
    const res = { cookie: jest.fn(), setHeader: jest.fn() } as any;
    expect(sessionResponse(res, { accessToken: 'access', refreshToken: 'secret' })).toEqual({ accessToken: 'access' });
    expect(res.cookie).toHaveBeenCalledWith('therapist_refresh', 'secret', expect.objectContaining({ httpOnly: true, sameSite: 'strict' }));
  });
  it('accepts an explicitly configured frontend origin', () => {
    const origin = 'http://127.0.0.1:18080';
    env.CORS_ALLOWED_ORIGINS.push(origin);
    try {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();
      protectSession({ headers: { origin, 'x-requested-with': 'XMLHttpRequest', 'sec-fetch-site': 'same-origin' } } as any, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    } finally {
      env.CORS_ALLOWED_ORIGINS.splice(env.CORS_ALLOWED_ORIGINS.indexOf(origin), 1);
    }
  });
  it('rejects cross-site and missing non-simple header', () => {
    for (const headers of [{}, { origin: 'https://attacker.invalid', 'x-requested-with': 'XMLHttpRequest' }]) {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();
      protectSession({ headers } as any, res, next);
      expect(res.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled();
    }
  });
});
