import { TestimonialsService } from './testimonials.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

describe('TestimonialsService', () => {
  let testimonialsService: TestimonialsService;

  beforeEach(() => {
    testimonialsService = new TestimonialsService();
    jest.clearAllMocks();
  });

  // =============================================
  // FIND ALL
  // =============================================
  describe('findAll', () => {
    it('should return all testimonials with pagination', async () => {
      // Arrange
      const mockTestimonials = [
        { id: 'test-1', clientName: 'Maria', content: 'Excelente!', rating: 5, isApproved: true },
        { id: 'test-2', clientName: 'João', content: 'Muito bom!', rating: 4, isApproved: false },
      ];
      prismaMock.testimonial.findMany.mockResolvedValue(mockTestimonials as any);
      prismaMock.testimonial.count.mockResolvedValue(2);

      // Act
      const result = await testimonialsService.findAll({});

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by pending status', async () => {
      // Arrange
      prismaMock.testimonial.findMany.mockResolvedValue([]);
      prismaMock.testimonial.count.mockResolvedValue(0);

      // Act
      const result = await testimonialsService.findAll({ status: 'pending' });

      // Assert
      expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isApproved: false }),
        })
      );
    });

    it('should filter by approved status', async () => {
      // Arrange
      prismaMock.testimonial.findMany.mockResolvedValue([]);
      prismaMock.testimonial.count.mockResolvedValue(0);

      // Act
      const result = await testimonialsService.findAll({ status: 'approved' });

      // Assert
      expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isApproved: true }),
        })
      );
    });
  });

  // =============================================
  // FIND PUBLIC
  // =============================================
  describe('findPublic', () => {
    it('should return only approved testimonials', async () => {
      // Arrange
      const mockTestimonials = [
        { id: 'test-1', clientName: 'Maria', isApproved: true, isFeatured: true },
      ];
      prismaMock.testimonial.findMany.mockResolvedValue(mockTestimonials as any);

      // Act
      const result = await testimonialsService.findPublic();

      // Assert
      expect(result.data).toHaveLength(1);
      expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isApproved: true },
        })
      );
    });

    it('should use default limit of 10', async () => {
      // Arrange
      prismaMock.testimonial.findMany.mockResolvedValue([]);

      // Act
      await testimonialsService.findPublic();

      // Assert
      expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });
  });

  // =============================================
  // FIND FEATURED
  // =============================================
  describe('findFeatured', () => {
    it('should return featured testimonials', async () => {
      // Arrange
      const mockTestimonials = [
        { id: 'test-1', clientName: 'Maria', isApproved: true, isFeatured: true },
      ];
      prismaMock.testimonial.findMany.mockResolvedValue(mockTestimonials as any);

      // Act
      const result = await testimonialsService.findFeatured();

      // Assert
      expect(result.data).toHaveLength(1);
      expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isApproved: true, isFeatured: true },
        })
      );
    });
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const createData = {
      userId: 'user-123',
      content: 'Leitura maravilhosa, muito assertiva!',
      rating: 5,
    };

    it('should create a new testimonial as pending', async () => {
      // Arrange
      const mockUser = {
        fullName: 'Maria Silva',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.testimonial.create.mockResolvedValue({
        id: 'new-test-id',
        clientId: createData.userId,
        clientName: mockUser.fullName,
        clientAvatarUrl: mockUser.avatarUrl,
        content: createData.content,
        rating: createData.rating,
        isApproved: false,
        isFeatured: false,
        client: { id: createData.userId, fullName: mockUser.fullName },
      } as any);

      // Act
      const result = await testimonialsService.create(createData);

      // Assert
      expect(result.data.content).toBe(createData.content);
      expect(result.data.isApproved).toBe(false);
      expect(result.data.clientName).toBe('Maria Silva');
    });

    it('should use "Anônimo" if user not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.testimonial.create.mockResolvedValue({
        id: 'new-test-id',
        clientName: 'Anônimo',
        content: createData.content,
        rating: createData.rating,
        isApproved: false,
      } as any);

      // Act
      const result = await testimonialsService.create(createData);

      // Assert
      expect(result.data.clientName).toBe('Anônimo');
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    it('should update testimonial approval status', async () => {
      // Arrange
      const mockTestimonial = {
        id: 'test-1',
        isApproved: false,
      };
      prismaMock.testimonial.findUnique.mockResolvedValue(mockTestimonial as any);
      prismaMock.testimonial.update.mockResolvedValue({
        ...mockTestimonial,
        isApproved: true,
      } as any);

      // Act
      const result = await testimonialsService.update('test-1', { isApproved: true });

      // Assert
      expect(result.data.isApproved).toBe(true);
    });

    it('should update testimonial featured status', async () => {
      // Arrange
      const mockTestimonial = {
        id: 'test-1',
        isFeatured: false,
      };
      prismaMock.testimonial.findUnique.mockResolvedValue(mockTestimonial as any);
      prismaMock.testimonial.update.mockResolvedValue({
        ...mockTestimonial,
        isFeatured: true,
      } as any);

      // Act
      const result = await testimonialsService.update('test-1', { isFeatured: true });

      // Assert
      expect(result.data.isFeatured).toBe(true);
    });

    it('should throw error if testimonial not found', async () => {
      // Arrange
      prismaMock.testimonial.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        testimonialsService.update('nonexistent', { isApproved: true })
      ).rejects.toThrow('Depoimento não encontrado');
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    it('should delete testimonial successfully', async () => {
      // Arrange
      const mockTestimonial = { id: 'test-1', clientName: 'Maria' };
      prismaMock.testimonial.findUnique.mockResolvedValue(mockTestimonial as any);
      prismaMock.testimonial.delete.mockResolvedValue(mockTestimonial as any);

      // Act
      const result = await testimonialsService.delete('test-1');

      // Assert
      expect(result.message).toContain('excluído');
    });

    it('should throw error if testimonial not found', async () => {
      // Arrange
      prismaMock.testimonial.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(testimonialsService.delete('nonexistent')).rejects.toThrow(
        'Depoimento não encontrado'
      );
    });
  });

  // =============================================
  // GET STATS
  // =============================================
  describe('getStats', () => {
    it('should return testimonial statistics', async () => {
      // Arrange
      prismaMock.testimonial.count.mockResolvedValueOnce(10); // total
      prismaMock.testimonial.count.mockResolvedValueOnce(8);  // approved
      prismaMock.testimonial.count.mockResolvedValueOnce(2);  // pending
      prismaMock.testimonial.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
      } as any);

      // Act
      const result = await testimonialsService.getStats();

      // Assert
      expect(result.data.total).toBe(10);
      expect(result.data.approved).toBe(8);
      expect(result.data.pending).toBe(2);
      expect(result.data.averageRating).toBe(4.5);
    });

    it('should return 0 for average rating when no testimonials', async () => {
      // Arrange
      prismaMock.testimonial.count.mockResolvedValue(0);
      prismaMock.testimonial.aggregate.mockResolvedValue({
        _avg: { rating: null },
      } as any);

      // Act
      const result = await testimonialsService.getStats();

      // Assert
      expect(result.data.averageRating).toBe(0);
    });
  });
});
