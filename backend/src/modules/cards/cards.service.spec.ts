import { CardsService } from './cards.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

const TENANT_ID = 'tenant-test';

describe('CardsService', () => {
  let cardsService: CardsService;

  beforeEach(() => {
    cardsService = new CardsService();
    jest.clearAllMocks();
  });

  // =============================================
  // FIND ALL
  // =============================================
  describe('findAll', () => {
    it('should return all cards ordered by number', async () => {
      // Arrange
      const mockCards = [
        { id: 'card-1', number: 1, name: 'O Cavaleiro', keywords: ['notícias'] },
        { id: 'card-2', number: 2, name: 'O Trevo', keywords: ['sorte'] },
      ];
      prismaMock.ciganoCard.findMany.mockResolvedValue(mockCards as any);

      // Act
      const result = await cardsService.findAll(TENANT_ID);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(prismaMock.ciganoCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_ID },
          orderBy: { number: 'asc' },
        })
      );
    });

    it('should return empty array when no cards exist', async () => {
      // Arrange
      prismaMock.ciganoCard.findMany.mockResolvedValue([]);

      // Act
      const result = await cardsService.findAll(TENANT_ID);

      // Assert
      expect(result.data).toHaveLength(0);
    });
  });

  // =============================================
  // FIND BY ID
  // =============================================
  describe('findById', () => {
    it('should return card by id', async () => {
      // Arrange
      const mockCard = {
        id: 'card-1',
        number: 1,
        name: 'O Cavaleiro',
        keywords: ['notícias', 'viagem'],
        generalMeaning: 'Significa notícias chegando',
      };
      prismaMock.ciganoCard.findFirst.mockResolvedValue(mockCard as any);

      // Act
      const result = await cardsService.findById('card-1', TENANT_ID);

      // Assert
      expect(result.data.name).toBe('O Cavaleiro');
      expect(result.data.number).toBe(1);
    });

    it('should throw error if card not found', async () => {
      // Arrange
      prismaMock.ciganoCard.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(cardsService.findById('nonexistent', TENANT_ID)).rejects.toThrow(
        'Carta não encontrada'
      );
    });
  });

  // =============================================
  // FIND BY NUMBER
  // =============================================
  describe('findByNumber', () => {
    it('should return card by number', async () => {
      // Arrange
      const mockCard = {
        id: 'card-1',
        number: 31,
        name: 'O Sol',
        keywords: ['sucesso', 'energia'],
      };
      prismaMock.ciganoCard.findUnique.mockResolvedValue(mockCard as any);

      // Act
      const result = await cardsService.findByNumber(31, TENANT_ID);

      // Assert
      expect(result.data.name).toBe('O Sol');
      expect(result.data.number).toBe(31);
    });

    it('should throw error if card number not found', async () => {
      // Arrange
      prismaMock.ciganoCard.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cardsService.findByNumber(99, TENANT_ID)).rejects.toThrow(
        'Carta não encontrada'
      );
    });
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const createData = {
      number: 37,
      name: 'Nova Carta',
      keywords: ['teste', 'nova'],
      generalMeaning: 'Significado geral',
    };

    it('should create a new card', async () => {
      // Arrange
      prismaMock.ciganoCard.findUnique.mockResolvedValue(null); // number not exists
      prismaMock.ciganoCard.create.mockResolvedValue({
        id: 'new-card-id',
        ...createData,
        imageUrl: '',
      } as any);

      // Act
      const result = await cardsService.create(createData, TENANT_ID);

      // Assert
      expect(result.data.name).toBe('Nova Carta');
      expect(result.data.number).toBe(37);
    });

    it('should throw error if card number already exists', async () => {
      // Arrange
      prismaMock.ciganoCard.findUnique.mockResolvedValue({
        id: 'existing',
        number: 37,
      } as any);

      // Act & Assert
      await expect(cardsService.create(createData, TENANT_ID)).rejects.toThrow(
        'Já existe uma carta com o número'
      );
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    it('should update card successfully', async () => {
      // Arrange
      const existingCard = {
        id: 'card-1',
        number: 1,
        name: 'O Cavaleiro',
      };
      prismaMock.ciganoCard.findFirst.mockResolvedValue(existingCard as any);
      prismaMock.ciganoCard.update.mockResolvedValue({
        ...existingCard,
        generalMeaning: 'Novo significado',
      } as any);

      // Act
      const result = await cardsService.update('card-1', { generalMeaning: 'Novo significado' }, TENANT_ID);

      // Assert
      expect(result.data.generalMeaning).toBe('Novo significado');
    });

    it('should throw error if card not found', async () => {
      // Arrange
      prismaMock.ciganoCard.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        cardsService.update('nonexistent', { name: 'Updated' }, TENANT_ID)
      ).rejects.toThrow('Carta não encontrada');
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    it('should delete card successfully', async () => {
      // Arrange
      const existingCard = { id: 'card-1', number: 1, name: 'O Cavaleiro' };
      prismaMock.ciganoCard.findFirst.mockResolvedValue(existingCard as any);
      prismaMock.readingCard.findFirst.mockResolvedValue(null); // not used in readings
      prismaMock.ciganoCard.delete.mockResolvedValue(existingCard as any);

      // Act
      const result = await cardsService.delete('card-1', TENANT_ID);

      // Assert
      expect(result.message).toContain('excluída');
    });

    it('should throw error if card is used in readings', async () => {
      // Arrange
      prismaMock.ciganoCard.findFirst.mockResolvedValue({ id: 'card-1' } as any);
      prismaMock.readingCard.findFirst.mockResolvedValue({ id: 'reading-card-1' } as any);

      // Act & Assert
      await expect(cardsService.delete('card-1', TENANT_ID)).rejects.toThrow(
        'sendo usada em leituras'
      );
    });

    it('should throw error if card not found', async () => {
      // Arrange
      prismaMock.ciganoCard.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(cardsService.delete('nonexistent', TENANT_ID)).rejects.toThrow(
        'Carta não encontrada'
      );
    });
  });

  // =============================================
  // GENERATE DECK
  // =============================================
  describe('generateDeck', () => {
    it('should generate the complete Cigano deck', async () => {
      // Arrange
      prismaMock.ciganoCard.count.mockResolvedValue(0);
      prismaMock.ciganoCard.createMany.mockResolvedValue({ count: 36 });

      // Act
      const result = await cardsService.generateDeck(TENANT_ID);

      // Assert
      expect(result.message).toContain('36 cartas criadas');
      expect(result.count).toBe(36);
    });

    it('should throw error if deck already exists', async () => {
      // Arrange
      prismaMock.ciganoCard.count.mockResolvedValue(36);

      // Act & Assert
      await expect(cardsService.generateDeck(TENANT_ID)).rejects.toThrow(
        'já foi gerado'
      );
    });
  });
});
