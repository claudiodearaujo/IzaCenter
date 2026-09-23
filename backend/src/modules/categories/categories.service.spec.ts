import { CategoriesService } from './categories.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

const TENANT_ID = 'tenant-test';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;

  beforeEach(() => {
    categoriesService = new CategoriesService();
    jest.clearAllMocks();
  });

  // =============================================
  // FIND ALL
  // =============================================
  describe('findAll', () => {
    it('should return active categories by default', async () => {
      // Arrange
      const mockCategories = [
        { id: 'cat-1', name: 'Consultas', slug: 'consultas', displayOrder: 1, isActive: true, _count: { products: 5 } },
        { id: 'cat-2', name: 'Leituras', slug: 'leituras', displayOrder: 2, isActive: true, _count: { products: 3 } },
      ];
      prismaMock.productCategory.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await categoriesService.findAll(false, TENANT_ID);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_ID, isActive: true },
        })
      );
    });

    it('should return all categories when includeInactive is true', async () => {
      // Arrange
      const mockCategories = [
        { id: 'cat-1', name: 'Consultas', isActive: true },
        { id: 'cat-2', name: 'Inativos', isActive: false },
      ];
      prismaMock.productCategory.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await categoriesService.findAll(true, TENANT_ID);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_ID },
        })
      );
    });
  });

  // =============================================
  // FIND BY ID
  // =============================================
  describe('findById', () => {
    it('should return category by id', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat-1',
        name: 'Consultas',
        slug: 'consultas',
        _count: { products: 5 },
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(mockCategory as any);

      // Act
      const result = await categoriesService.findById('cat-1', TENANT_ID);

      // Assert
      expect(result.data.id).toBe('cat-1');
      expect(result.data.name).toBe('Consultas');
    });

    it('should throw error if category not found', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriesService.findById('nonexistent', TENANT_ID)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  // =============================================
  // FIND BY SLUG
  // =============================================
  describe('findBySlug', () => {
    it('should return category by slug with products', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat-1',
        name: 'Consultas',
        slug: 'consultas',
        products: [
          { id: 'prod-1', name: 'Leitura Básica' },
        ],
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(mockCategory as any);

      // Act
      const result = await categoriesService.findBySlug('consultas', TENANT_ID);

      // Assert
      expect(result.data.slug).toBe('consultas');
      expect(result.data.products).toHaveLength(1);
    });

    it('should throw error if category slug not found', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriesService.findBySlug('nonexistent', TENANT_ID)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const createData = {
      name: 'Nova Categoria',
      description: 'Descrição da categoria',
    };

    it('should create a new category with auto-generated slug', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null); // slug not exists
      prismaMock.productCategory.aggregate.mockResolvedValue({ _max: { displayOrder: 2 } } as any);
      prismaMock.productCategory.create.mockResolvedValue({
        id: 'new-cat-id',
        name: createData.name,
        slug: 'nova-categoria',
        description: createData.description,
        isActive: true,
        displayOrder: 3,
      } as any);

      // Act
      const result = await categoriesService.create(createData, TENANT_ID);

      // Assert
      expect(result.data.name).toBe('Nova Categoria');
      expect(prismaMock.productCategory.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if slug already exists', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue({
        id: 'existing',
        slug: 'nova-categoria',
      } as any);

      // Act & Assert
      await expect(categoriesService.create(createData, TENANT_ID)).rejects.toThrow(
        'Já existe uma categoria com este nome'
      );
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    it('should update category successfully', async () => {
      // Arrange
      const existingCategory = {
        id: 'cat-1',
        name: 'Consultas',
        slug: 'consultas',
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.update.mockResolvedValue({
        ...existingCategory,
        description: 'Nova descrição',
      } as any);

      // Act
      const result = await categoriesService.update('cat-1', { description: 'Nova descrição' }, TENANT_ID);

      // Assert
      expect(result.data.description).toBe('Nova descrição');
    });

    it('should throw error if category not found', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        categoriesService.update('nonexistent', { name: 'Updated' }, TENANT_ID)
      ).rejects.toThrow('Categoria não encontrada');
    });

    it('should update slug when name changes', async () => {
      // Arrange
      const existingCategory = {
        id: 'cat-1',
        name: 'Consultas',
        slug: 'consultas',
      };
      prismaMock.productCategory.findFirst
        .mockResolvedValueOnce(existingCategory as any)
        .mockResolvedValueOnce(null); // no conflicting slug
      prismaMock.productCategory.update.mockResolvedValue({
        ...existingCategory,
        name: 'Novo Nome',
        slug: 'novo-nome',
      } as any);

      // Act
      const result = await categoriesService.update('cat-1', { name: 'Novo Nome' }, TENANT_ID);

      // Assert
      expect(result.data.name).toBe('Novo Nome');
    });
  });

  // =============================================
  // REORDER
  // =============================================
  describe('reorder', () => {
    it('should reorder category to higher position', async () => {
      // Arrange
      const existingCategory = {
        id: 'cat-1',
        displayOrder: 3,
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.updateMany.mockResolvedValue({ count: 2 } as any);
      prismaMock.productCategory.update.mockResolvedValue({
        ...existingCategory,
        displayOrder: 1,
      } as any);

      // Act
      const result = await categoriesService.reorder('cat-1', 1, TENANT_ID);

      // Assert
      expect(result.data.displayOrder).toBe(1);
    });

    it('should throw error if category not found', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriesService.reorder('nonexistent', 1, TENANT_ID)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    it('should delete category successfully', async () => {
      // Arrange
      const existingCategory = {
        id: 'cat-1',
        name: 'Consultas',
        displayOrder: 2,
        _count: { products: 0 },
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.delete.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.updateMany.mockResolvedValue({ count: 1 } as any);

      // Act
      const result = await categoriesService.delete('cat-1', TENANT_ID);

      // Assert
      expect(result.message).toContain('excluída');
    });

    it('should throw error if category has products', async () => {
      // Arrange
      const categoryWithProducts = {
        id: 'cat-1',
        name: 'Consultas',
        _count: { products: 5 },
      };
      prismaMock.productCategory.findFirst.mockResolvedValue(categoryWithProducts as any);

      // Act & Assert
      await expect(categoriesService.delete('cat-1', TENANT_ID)).rejects.toThrow(
        'produto(s) vinculado(s)'
      );
    });

    it('should throw error if category not found', async () => {
      // Arrange
      prismaMock.productCategory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriesService.delete('nonexistent', TENANT_ID)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });
});
