/**
 * Integration Tests for Users API
 * 
 * These tests verify user management operations.
 */

import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  disconnectTestDatabase,
} from './setup';

describe('Users Integration Tests', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDatabase();
  });

  describe('User CRUD Operations', () => {
    it('should create a user in the database', async () => {
      // Act
      const user = await createTestUser({
        email: 'newuser@test.com',
        fullName: 'New User',
        role: 'CLIENT',
      });

      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBe('newuser@test.com');
      expect(user.fullName).toBe('New User');
      expect(user.role).toBe('CLIENT');
    });

    it('should find user by email', async () => {
      // Arrange
      await createTestUser({
        email: 'findme@test.com',
        fullName: 'Find Me User',
      });

      // Act
      const user = await testPrisma.user.findUnique({
        where: { email: 'findme@test.com' },
      });

      // Assert
      expect(user).not.toBeNull();
      expect(user?.fullName).toBe('Find Me User');
    });

    it('should update user profile', async () => {
      // Arrange
      const user = await createTestUser({
        email: 'update@test.com',
        fullName: 'Original Name',
      });

      // Act
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: {
          fullName: 'Updated Name',
          phone: '11999999999',
        },
      });

      // Assert
      expect(updatedUser.fullName).toBe('Updated Name');
      expect(updatedUser.phone).toBe('11999999999');
    });

    it('should delete a user', async () => {
      // Arrange
      const user = await createTestUser({
        email: 'delete@test.com',
        fullName: 'To Delete',
      });

      // Act
      await testPrisma.user.delete({
        where: { id: user.id },
      });

      // Assert
      const deletedUser = await testPrisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });
  });

  describe('User Queries', () => {
    beforeAll(async () => {
      // Create multiple users for query tests
      await createTestUser({ email: 'admin@test.com', role: 'ADMIN' });
      await createTestUser({ email: 'client1@test.com', role: 'CLIENT' });
      await createTestUser({ email: 'client2@test.com', role: 'CLIENT' });
    });

    it('should count users by role', async () => {
      // Act
      const clientCount = await testPrisma.user.count({
        where: { role: 'CLIENT' },
      });

      const adminCount = await testPrisma.user.count({
        where: { role: 'ADMIN' },
      });

      // Assert
      expect(clientCount).toBeGreaterThanOrEqual(2);
      expect(adminCount).toBeGreaterThanOrEqual(1);
    });

    it('should find users with pagination', async () => {
      // Act
      const page1 = await testPrisma.user.findMany({
        take: 2,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      const page2 = await testPrisma.user.findMany({
        take: 2,
        skip: 2,
        orderBy: { createdAt: 'desc' },
      });

      // Assert
      expect(page1).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0]?.id);
    });

    it('should search users by name or email', async () => {
      // Arrange
      await createTestUser({
        email: 'searchable@test.com',
        fullName: 'Maria Silva',
      });

      // Act
      const byEmail = await testPrisma.user.findMany({
        where: {
          email: { contains: 'searchable', mode: 'insensitive' },
        },
      });

      const byName = await testPrisma.user.findMany({
        where: {
          fullName: { contains: 'Maria', mode: 'insensitive' },
        },
      });

      // Assert
      expect(byEmail.length).toBeGreaterThanOrEqual(1);
      expect(byName.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('User Business Rules', () => {
    it('should enforce unique email constraint', async () => {
      // Arrange
      await createTestUser({
        email: 'unique@test.com',
        fullName: 'First User',
      });

      // Act & Assert
      await expect(
        createTestUser({
          email: 'unique@test.com',
          fullName: 'Second User',
        })
      ).rejects.toThrow();
    });

    it('should not expose password hash in select', async () => {
      // Arrange
      const user = await createTestUser({
        email: 'secure@test.com',
        password: 'secretpassword',
      });

      // Act
      const publicUser = await testPrisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          // passwordHash NOT included
        },
      });

      // Assert
      expect(publicUser).not.toHaveProperty('passwordHash');
    });
  });

  describe('User Relations', () => {
    it('should get user with their orders', async () => {
      // Arrange - We'll just verify the query works
      const user = await createTestUser({
        email: 'withorders@test.com',
        fullName: 'User With Orders',
      });

      // Act
      const userWithOrders = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: {
          orders: true,
        },
      });

      // Assert
      expect(userWithOrders).not.toBeNull();
      expect(userWithOrders?.orders).toBeDefined();
      expect(Array.isArray(userWithOrders?.orders)).toBe(true);
    });
  });
});
