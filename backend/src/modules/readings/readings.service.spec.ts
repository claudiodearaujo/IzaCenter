import { ReadingsService } from './readings.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

// Mock email utils
jest.mock('../../utils/email.util', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    orderConfirmation: jest.fn().mockReturnValue({
      subject: 'Pedido Confirmado',
      html: '<p>Pedido confirmado</p>',
    }),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    orderConfirmation: jest.fn().mockReturnValue({
      subject: 'Pedido Confirmado',
      html: '<p>Pedido confirmado</p>',
    }),
  },
}));

describe('ReadingsService', () => {
  let readingsService: ReadingsService;

  beforeEach(() => {
    readingsService = new ReadingsService();
    jest.clearAllMocks();
  });

  // =============================================
  // FIND ALL
  // =============================================
  describe('findAll', () => {
    const mockReadings = [
      {
        id: 'reading-1',
        title: 'Leitura Completa',
        status: 'PENDING',
        client: { id: 'client-1', fullName: 'Cliente 1', email: 'client1@test.com' },
        orderItem: { product: { id: 'product-1', name: 'Produto 1' } },
      },
    ];

    it('should list readings with default pagination', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue(mockReadings as any);
      prismaMock.reading.count.mockResolvedValue(1);

      // Act
      const result = await readingsService.findAll({});

      // Assert
      expect(result.data).toEqual(mockReadings);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.objectContaining({
          client: expect.any(Object),
          orderItem: expect.any(Object),
        }),
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
      expect(prismaMock.reading.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should apply custom pagination', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue(mockReadings as any);
      prismaMock.reading.count.mockResolvedValue(25);

      // Act
      const result = await readingsService.findAll({ page: 3, limit: 5 });

      // Assert
      expect(result.meta).toEqual({
        total: 25,
        page: 3,
        limit: 5,
        totalPages: 5,
      });
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });

    it('should filter by status', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue(mockReadings as any);
      prismaMock.reading.count.mockResolvedValue(1);

      // Act
      await readingsService.findAll({ status: 'PENDING' });

      // Assert
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } })
      );
      expect(prismaMock.reading.count).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
      });
    });

    it('should filter by search term', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue(mockReadings as any);
      prismaMock.reading.count.mockResolvedValue(1);

      // Act
      await readingsService.findAll({ search: 'Cliente' });

      // Assert
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { client: { fullName: { contains: 'Cliente', mode: 'insensitive' } } },
              { client: { email: { contains: 'Cliente', mode: 'insensitive' } } },
              { title: { contains: 'Cliente', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should combine status and search filters', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue([] as any);
      prismaMock.reading.count.mockResolvedValue(0);

      // Act
      await readingsService.findAll({ status: 'IN_PROGRESS', search: 'test' });

      // Assert
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'IN_PROGRESS',
            OR: expect.any(Array),
          },
        })
      );
    });
  });

  // =============================================
  // FIND BY USER
  // =============================================
  describe('findByUser', () => {
    const userId = 'user-123';
    const mockReadings = [
      {
        id: 'reading-1',
        clientId: userId,
        title: 'Leitura do Usuário',
        orderItem: { product: { id: 'p-1', name: 'Produto', coverImageUrl: null } },
        cards: [],
      },
    ];

    it('should list readings for a user', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue(mockReadings as any);

      // Act
      const result = await readingsService.findByUser(userId);

      // Assert
      expect(result.data).toEqual(mockReadings);
      expect(prismaMock.reading.findMany).toHaveBeenCalledWith({
        where: { clientId: userId },
        include: expect.objectContaining({
          orderItem: expect.any(Object),
          cards: expect.any(Object),
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no readings', async () => {
      // Arrange
      prismaMock.reading.findMany.mockResolvedValue([]);

      // Act
      const result = await readingsService.findByUser(userId);

      // Assert
      expect(result.data).toEqual([]);
    });
  });

  // =============================================
  // FIND BY ID
  // =============================================
  describe('findById', () => {
    const readingId = 'reading-123';
    const mockReading = {
      id: readingId,
      clientId: 'client-123',
      title: 'Leitura Completa',
      status: 'PENDING',
      client: { id: 'client-123', fullName: 'Cliente Teste', email: 'client@test.com' },
      orderItem: { product: { id: 'p-1', name: 'Produto' } },
      cards: [],
    };

    it('should get reading by id', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);

      // Act
      const result = await readingsService.findById(readingId);

      // Assert
      expect(result.data).toEqual(mockReading);
      expect(prismaMock.reading.findUnique).toHaveBeenCalledWith({
        where: { id: readingId },
        include: expect.objectContaining({
          client: expect.any(Object),
          orderItem: expect.any(Object),
          cards: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if reading not found', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(readingsService.findById(readingId)).rejects.toThrow(
        'Leitura não encontrada'
      );
    });

    it('should return reading when userId matches clientId', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);

      // Act
      const result = await readingsService.findById(readingId, 'client-123');

      // Assert
      expect(result.data).toEqual(mockReading);
    });

    it('should throw NotFoundException when userId does not match clientId', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);

      // Act & Assert
      await expect(
        readingsService.findById(readingId, 'other-user')
      ).rejects.toThrow('Leitura não encontrada');
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    const readingId = 'reading-123';
    const updateData = {
      title: 'Leitura Atualizada',
      introduction: 'Nova introdução',
      generalGuidance: 'Orientação geral',
    };

    const mockReading = {
      id: readingId,
      status: 'PENDING',
      title: 'Leitura Original',
    };

    const mockUpdatedReading = {
      id: readingId,
      status: 'IN_PROGRESS',
      title: 'Leitura Atualizada',
      introduction: 'Nova introdução',
      generalGuidance: 'Orientação geral',
    };

    it('should update reading successfully', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          reading: { update: jest.fn().mockResolvedValue(mockUpdatedReading) },
          readingCard: { deleteMany: jest.fn(), createMany: jest.fn() },
        });
      });

      // Act
      const result = await readingsService.update(readingId, updateData);

      // Assert
      expect(result.data).toEqual(mockUpdatedReading);
    });

    it('should update reading with cards', async () => {
      // Arrange
      const dataWithCards = {
        ...updateData,
        cards: [
          {
            cardId: 'card-1',
            position: 1,
            positionName: 'Passado',
            interpretation: 'Interpretação do passado',
            isReversed: false,
          },
        ],
      };

      const mockTxReadingUpdate = jest.fn().mockResolvedValue(mockUpdatedReading);
      const mockTxDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
      const mockTxCreateMany = jest.fn().mockResolvedValue({ count: 1 });

      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          reading: { update: mockTxReadingUpdate },
          readingCard: {
            deleteMany: mockTxDeleteMany,
            createMany: mockTxCreateMany,
          },
        });
      });

      // Act
      await readingsService.update(readingId, dataWithCards);

      // Assert
      expect(mockTxDeleteMany).toHaveBeenCalledWith({
        where: { readingId },
      });
      expect(mockTxCreateMany).toHaveBeenCalledWith({
        data: [
          {
            readingId,
            cardId: 'card-1',
            position: 1,
            positionName: 'Passado',
            interpretation: 'Interpretação do passado',
            isReversed: false,
          },
        ],
      });
    });

    it('should throw NotFoundException if reading not found', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(readingsService.update(readingId, updateData)).rejects.toThrow(
        'Leitura não encontrada'
      );
    });

    it('should throw BadRequestException if reading is published', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue({
        ...mockReading,
        status: 'PUBLISHED',
      } as any);

      // Act & Assert
      await expect(readingsService.update(readingId, updateData)).rejects.toThrow(
        'Leituras publicadas não podem ser editadas'
      );
    });
  });

  // =============================================
  // UPDATE STATUS
  // =============================================
  describe('updateStatus', () => {
    const readingId = 'reading-123';
    const mockReading = {
      id: readingId,
      title: 'Leitura Completa',
      status: 'IN_PROGRESS',
      client: {
        id: 'client-123',
        fullName: 'Cliente Teste',
        email: 'client@test.com',
      },
    };

    it('should update reading status', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.reading.update.mockResolvedValue({
        ...mockReading,
        status: 'IN_PROGRESS',
      } as any);

      // Act
      const result = await readingsService.updateStatus(readingId, 'IN_PROGRESS');

      // Assert
      expect(result.data.status).toBe('IN_PROGRESS');
      expect(prismaMock.reading.update).toHaveBeenCalledWith({
        where: { id: readingId },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('should set publishedAt and readingDate when publishing', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.reading.update.mockResolvedValue({
        ...mockReading,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readingDate: new Date(),
      } as any);

      // Act
      await readingsService.updateStatus(readingId, 'PUBLISHED');

      // Assert
      expect(prismaMock.reading.update).toHaveBeenCalledWith({
        where: { id: readingId },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
          readingDate: expect.any(Date),
        },
      });
    });

    it('should send email when publishing reading', async () => {
      // Arrange
      const { sendEmail } = require('../../utils/email.util');
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.reading.update.mockResolvedValue({
        ...mockReading,
        status: 'PUBLISHED',
      } as any);

      // Act
      await readingsService.updateStatus(readingId, 'PUBLISHED');

      // Assert
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: expect.stringContaining('Leitura'),
          html: expect.stringContaining('Cliente Teste'),
        })
      );
    });

    it('should not send email when client has no email', async () => {
      // Arrange
      const { sendEmail } = require('../../utils/email.util');
      const readingNoEmail = {
        ...mockReading,
        client: { ...mockReading.client, email: '' },
      };
      prismaMock.reading.findUnique.mockResolvedValue(readingNoEmail as any);
      prismaMock.reading.update.mockResolvedValue({
        ...readingNoEmail,
        status: 'PUBLISHED',
      } as any);

      // Act
      await readingsService.updateStatus(readingId, 'PUBLISHED');

      // Assert
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if reading not found', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        readingsService.updateStatus(readingId, 'PUBLISHED')
      ).rejects.toThrow('Leitura não encontrada');
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    const readingId = 'reading-123';

    it('should delete reading successfully', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue({
        id: readingId,
        status: 'PENDING',
      } as any);
      prismaMock.reading.delete.mockResolvedValue({} as any);

      // Act
      const result = await readingsService.delete(readingId);

      // Assert
      expect(result.message).toBe('Leitura excluída com sucesso');
      expect(prismaMock.reading.delete).toHaveBeenCalledWith({
        where: { id: readingId },
      });
    });

    it('should delete IN_PROGRESS reading', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue({
        id: readingId,
        status: 'IN_PROGRESS',
      } as any);
      prismaMock.reading.delete.mockResolvedValue({} as any);

      // Act
      const result = await readingsService.delete(readingId);

      // Assert
      expect(result.message).toBe('Leitura excluída com sucesso');
    });

    it('should throw NotFoundException if reading not found', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(readingsService.delete(readingId)).rejects.toThrow(
        'Leitura não encontrada'
      );
    });

    it('should throw BadRequestException if reading is published', async () => {
      // Arrange
      prismaMock.reading.findUnique.mockResolvedValue({
        id: readingId,
        status: 'PUBLISHED',
      } as any);

      // Act & Assert
      await expect(readingsService.delete(readingId)).rejects.toThrow(
        'Leituras publicadas não podem ser excluídas'
      );
      expect(prismaMock.reading.delete).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // GET STATS
  // =============================================
  describe('getStats', () => {
    it('should return reading statistics', async () => {
      // Arrange
      prismaMock.reading.count.mockResolvedValueOnce(20); // total
      prismaMock.reading.count.mockResolvedValueOnce(5);  // pending
      prismaMock.reading.count.mockResolvedValueOnce(8);  // inProgress
      prismaMock.reading.count.mockResolvedValueOnce(7);  // published

      // Act
      const result = await readingsService.getStats();

      // Assert
      expect(result.data).toEqual({
        total: 20,
        pending: 5,
        inProgress: 8,
        published: 7,
      });
    });

    it('should return zeros when no readings exist', async () => {
      // Arrange
      prismaMock.reading.count.mockResolvedValue(0);

      // Act
      const result = await readingsService.getStats();

      // Assert
      expect(result.data).toEqual({
        total: 0,
        pending: 0,
        inProgress: 0,
        published: 0,
      });
    });

    it('should call count with correct filters', async () => {
      // Arrange
      prismaMock.reading.count.mockResolvedValue(0);

      // Act
      await readingsService.getStats();

      // Assert
      expect(prismaMock.reading.count).toHaveBeenCalledTimes(4);
      expect(prismaMock.reading.count).toHaveBeenNthCalledWith(1);
      expect(prismaMock.reading.count).toHaveBeenNthCalledWith(2, {
        where: { status: 'PENDING' },
      });
      expect(prismaMock.reading.count).toHaveBeenNthCalledWith(3, {
        where: { status: 'IN_PROGRESS' },
      });
      expect(prismaMock.reading.count).toHaveBeenNthCalledWith(4, {
        where: { status: 'PUBLISHED' },
      });
    });
  });
});
