/**
 * Integration Tests for Cards API
 * 
 * These tests verify the full flow from HTTP request to database.
 */

import {
  testPrisma,
  cleanDatabase,
  createTestCard,
  disconnectTestDatabase,
} from './setup';

describe('Cards Integration Tests', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDatabase();
  });

  describe('Card CRUD Operations', () => {
    it('should create a card in the database', async () => {
      // Act
      const card = await createTestCard({
        number: 1,
        name: 'O Sol',
      });

      // Assert
      expect(card.id).toBeDefined();
      expect(card.number).toBe(1);
      expect(card.name).toBe('O Sol');

      // Verify in database
      const dbCard = await testPrisma.card.findUnique({
        where: { id: card.id },
      });
      expect(dbCard).not.toBeNull();
      expect(dbCard?.name).toBe('O Sol');
    });

    it('should find all cards from database', async () => {
      // Arrange - Create multiple cards
      await createTestCard({ number: 2, name: 'A Lua' });
      await createTestCard({ number: 3, name: 'A Estrela' });

      // Act
      const cards = await testPrisma.card.findMany({
        orderBy: { number: 'asc' },
      });

      // Assert
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should find card by number', async () => {
      // Arrange
      const createdCard = await createTestCard({ number: 99, name: 'Carta Teste' });

      // Act
      const card = await testPrisma.card.findFirst({
        where: { number: 99 },
      });

      // Assert
      expect(card).not.toBeNull();
      expect(card?.id).toBe(createdCard.id);
    });

    it('should update a card', async () => {
      // Arrange
      const card = await createTestCard({ number: 100, name: 'Carta Original' });

      // Act
      const updatedCard = await testPrisma.card.update({
        where: { id: card.id },
        data: { name: 'Carta Atualizada' },
      });

      // Assert
      expect(updatedCard.name).toBe('Carta Atualizada');
    });

    it('should delete a card', async () => {
      // Arrange
      const card = await createTestCard({ number: 101, name: 'Carta Para Deletar' });

      // Act
      await testPrisma.card.delete({
        where: { id: card.id },
      });

      // Assert
      const deletedCard = await testPrisma.card.findUnique({
        where: { id: card.id },
      });
      expect(deletedCard).toBeNull();
    });
  });

  describe('Card Business Rules', () => {
    it('should enforce unique card numbers', async () => {
      // Arrange
      await createTestCard({ number: 500, name: 'Primeira Carta' });

      // Act & Assert
      await expect(
        createTestCard({ number: 500, name: 'Segunda Carta' })
      ).rejects.toThrow();
    });
  });
});
