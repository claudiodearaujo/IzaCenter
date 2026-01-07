// apps/backend/src/config/redis.ts

import { createClient } from 'redis';
import { env } from './env';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

/**
 * Get Redis client instance (singleton)
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // If no Redis URL configured, return a mock client (dev/test)
  if (!env.REDIS_URL) {
    console.warn('⚠️ Redis URL not configured. Token blacklisting and caching disabled.');
    // Return a mock client that does nothing
    return createMockRedisClient();
  }

  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  await redisClient.connect();

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Mock Redis client for development/testing without Redis
 */
function createMockRedisClient(): RedisClient {
  const mockStorage = new Map<string, { value: string; expiry?: number }>();

  return {
    isOpen: true,
    get: async (key: string) => {
      const item = mockStorage.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) {
        mockStorage.delete(key);
        return null;
      }
      return item.value;
    },
    set: async (key: string, value: string) => {
      mockStorage.set(key, { value });
      return 'OK';
    },
    setEx: async (key: string, seconds: number, value: string) => {
      mockStorage.set(key, {
        value,
        expiry: Date.now() + seconds * 1000,
      });
      return 'OK';
    },
    del: async (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      let count = 0;
      keys.forEach((k) => {
        if (mockStorage.delete(k)) count++;
      });
      return count;
    },
    exists: async (key: string) => {
      return mockStorage.has(key) ? 1 : 0;
    },
    expire: async (key: string, seconds: number) => {
      const item = mockStorage.get(key);
      if (!item) return false;
      item.expiry = Date.now() + seconds * 1000;
      return true;
    },
    ttl: async (key: string) => {
      const item = mockStorage.get(key);
      if (!item) return -2;
      if (!item.expiry) return -1;
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
  } as any;
}

/**
 * Token Blacklist Helper Functions
 */
export const tokenBlacklist = {
  /**
   * Add token to blacklist
   * @param token - JWT token to blacklist
   * @param expiresInSeconds - Token TTL (Time To Live)
   */
  async add(token: string, expiresInSeconds: number): Promise<void> {
    const client = await getRedisClient();
    const key = `blacklist:${token}`;
    await client.setEx(key, expiresInSeconds, 'revoked');
  },

  /**
   * Check if token is blacklisted
   * @param token - JWT token to check
   * @returns true if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const client = await getRedisClient();
    const key = `blacklist:${token}`;
    const exists = await client.exists(key);
    return exists === 1;
  },

  /**
   * Remove token from blacklist (rarely needed)
   * @param token - JWT token to remove
   */
  async remove(token: string): Promise<void> {
    const client = await getRedisClient();
    const key = `blacklist:${token}`;
    await client.del(key);
  },
};

/**
 * Cache Helper Functions
 */
export const cache = {
  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null
   */
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const client = await getRedisClient();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  },

  /**
   * Delete from cache
   * @param key - Cache key or array of keys
   */
  async del(key: string | string[]): Promise<void> {
    const client = await getRedisClient();
    await client.del(key);
  },

  /**
   * Check if key exists
   * @param key - Cache key
   */
  async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  },

  /**
   * Invalidate cache by pattern
   * @param pattern - Pattern to match (e.g., 'user:*')
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const client = await getRedisClient();
    // Note: SCAN is better for production than KEYS
    // This is a simplified version
    console.warn(`Cache invalidation for pattern: ${pattern} (implement SCAN for production)`);
  },
};
