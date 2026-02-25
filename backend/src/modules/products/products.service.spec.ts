import { ProductsService } from './products.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { Prisma } from '@prisma/client';

// Mock supabase storage
jest.mock('../../config/supabase', () => ({
  storage: {
    upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' } }),
    delete: jest.fn().mockResolvedValue({}),
    getPublicUrl: jest.fn().mockReturnValue('https://storage.test.com/public/test-path'),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  generateSlug: jest.fn().mockImplementation((name: string) =>
    name.toLowerCase().replace(/\s+/g, '-')
  ),
  generateFileName: jest.fn().mockReturnValue('generated-file-name.jpg'),
  buildPaginationMeta: jest.fn().mockReturnValue({
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 10,
  }),
}));

describe('ProductsService', () => {
  let productsService: ProductsService;

  beforeEach(() => {
    productsService = new ProductsService();
    jest.clearAllMocks();
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const createData = {
      name: 'Leitura de Tarot',
      shortDescription: 'Uma leitura completa',
      description: 'Descrição detalhada',
      price: 50,
      productType: 'READING' as const,
      categoryId: 'cat-123',
    };

    const mockProduct = {
      id: 'product-123',
      name: 'Leitura de Tarot',
      slug: 'leitura-de-tarot',
      shortDescription: 'Uma leitura completa',
      description: 'Descrição detalhada',
      price: new Prisma.Decimal('50.00'),
      productType: 'READING',
      categoryId: 'cat-123',
      isActive: true,
      isFeatured: false,
      category: { id: 'cat-123', name: 'Tarot', slug: 'tarot' },
      attachments: [],
    };

    it('should create product successfully with generated slug', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue(mockProduct as any);

      // Act
      const result = await productsService.create(createData as any);

      // Assert
      expect(result.id).toBe('product-123');
      expect(result.slug).toBe('leitura-de-tarot');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'leitura-de-tarot' },
      });
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          slug: 'leitura-de-tarot',
        },
        include: {
          category: true,
          attachments: true,
        },
      });
    });

    it('should create product with provided slug', async () => {
      // Arrange
      const dataWithSlug = { ...createData, slug: 'custom-slug' };
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue({
        ...mockProduct,
        slug: 'custom-slug',
      } as any);

      // Act
      const result = await productsService.create(dataWithSlug as any);

      // Assert
      expect(result.slug).toBe('custom-slug');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'custom-slug' },
      });
    });

    it('should throw conflict error if slug already exists', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

      // Act & Assert
      await expect(productsService.create(createData as any)).rejects.toThrow(
        'Já existe um produto com este slug'
      );
      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // GET BY ID
  // =============================================
  describe('getById', () => {
    const productId = 'product-123';
    const mockProduct = {
      id: productId,
      name: 'Leitura de Tarot',
      slug: 'leitura-de-tarot',
      price: new Prisma.Decimal('50.00'),
      isActive: true,
      category: { id: 'cat-123', name: 'Tarot', slug: 'tarot' },
      attachments: [],
    };

    it('should get product by id successfully', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

      // Act
      const result = await productsService.getById(productId);

      // Assert
      expect(result.id).toBe(productId);
      expect(result.name).toBe('Leitura de Tarot');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          category: true,
          attachments: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw not found error if product does not exist', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(productsService.getById(productId)).rejects.toThrow('Produto');
    });
  });

  // =============================================
  // GET BY SLUG
  // =============================================
  describe('getBySlug', () => {
    const slug = 'leitura-de-tarot';
    const mockProduct = {
      id: 'product-123',
      name: 'Leitura de Tarot',
      slug,
      price: new Prisma.Decimal('50.00'),
      isActive: true,
      category: { id: 'cat-123', name: 'Tarot', slug: 'tarot' },
      attachments: [],
    };

    it('should get active product by slug successfully', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

      // Act
      const result = await productsService.getBySlug(slug);

      // Assert
      expect(result.slug).toBe(slug);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { slug, isActive: true },
        include: {
          category: true,
          attachments: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw not found error if product does not exist or is inactive', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(productsService.getBySlug(slug)).rejects.toThrow('Produto');
    });
  });

  // =============================================
  // LIST
  // =============================================
  describe('list', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Produto 1',
        slug: 'produto-1',
        price: new Prisma.Decimal('50.00'),
        isActive: true,
        category: { id: 'cat-1', name: 'Tarot', slug: 'tarot' },
      },
    ];

    it('should list products with pagination', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      const result = await productsService.list(query as any);

      // Assert
      expect(result.data).toEqual(mockProducts);
      expect(result.meta).toBeDefined();
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    });

    it('should filter by search term', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        search: 'Tarot',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'Tarot', mode: 'insensitive' } },
              { shortDescription: { contains: 'Tarot', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter by categoryId', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        categoryId: 'cat-123',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-123',
          }),
        })
      );
    });

    it('should filter by productType', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        productType: 'READING',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productType: 'READING',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        isActive: true,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should filter by isFeatured', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        isFeatured: true,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true,
          }),
        })
      );
    });

    it('should filter by price range', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        minPrice: 10,
        maxPrice: 100,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10, lte: 100 },
          }),
        })
      );
    });

    it('should apply publicOnly filters when true', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.list(query as any, true);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.any(Array),
            AND: expect.any(Array),
          }),
        })
      );
    });
  });

  // =============================================
  // GET FEATURED
  // =============================================
  describe('getFeatured', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Produto Destaque',
        isActive: true,
        isFeatured: true,
        category: { id: 'cat-1', name: 'Tarot', slug: 'tarot' },
      },
    ];

    it('should get featured products with default limit', async () => {
      // Arrange
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);

      // Act
      const result = await productsService.getFeatured();

      // Assert
      expect(result).toEqual(mockProducts);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isFeatured: true,
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    });

    it('should get featured products with custom limit', async () => {
      // Arrange
      prismaMock.product.findMany.mockResolvedValue(mockProducts as any);

      // Act
      const result = await productsService.getFeatured(3);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        })
      );
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    const productId = 'product-123';
    const existingProduct = {
      id: productId,
      name: 'Leitura de Tarot',
      slug: 'leitura-de-tarot',
      price: new Prisma.Decimal('50.00'),
      isActive: true,
    };

    it('should update product successfully', async () => {
      // Arrange
      const updateData = { name: 'Leitura Atualizada' };
      prismaMock.product.findUnique.mockResolvedValue(existingProduct as any);
      prismaMock.product.update.mockResolvedValue({
        ...existingProduct,
        ...updateData,
        category: null,
        attachments: [],
      } as any);

      // Act
      const result = await productsService.update(productId, updateData as any);

      // Assert
      expect(result.name).toBe('Leitura Atualizada');
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
          attachments: true,
        },
      });
    });

    it('should update product slug when unique', async () => {
      // Arrange
      const updateData = { slug: 'novo-slug' };
      prismaMock.product.findUnique
        .mockResolvedValueOnce(existingProduct as any) // existing product
        .mockResolvedValueOnce(null); // slug check
      prismaMock.product.update.mockResolvedValue({
        ...existingProduct,
        slug: 'novo-slug',
        category: null,
        attachments: [],
      } as any);

      // Act
      const result = await productsService.update(productId, updateData as any);

      // Assert
      expect(result.slug).toBe('novo-slug');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'novo-slug' },
      });
    });

    it('should throw not found error if product does not exist', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        productsService.update(productId, { name: 'test' } as any)
      ).rejects.toThrow('Produto');
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

    it('should throw conflict error if new slug already exists', async () => {
      // Arrange
      const updateData = { slug: 'existing-slug' };
      prismaMock.product.findUnique
        .mockResolvedValueOnce(existingProduct as any) // existing product
        .mockResolvedValueOnce({ id: 'other-product', slug: 'existing-slug' } as any); // slug collision

      // Act & Assert
      await expect(
        productsService.update(productId, updateData as any)
      ).rejects.toThrow('Já existe um produto com este slug');
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

    it('should skip slug uniqueness check if slug unchanged', async () => {
      // Arrange
      const updateData = { slug: 'leitura-de-tarot' };
      prismaMock.product.findUnique.mockResolvedValue(existingProduct as any);
      prismaMock.product.update.mockResolvedValue({
        ...existingProduct,
        category: null,
        attachments: [],
      } as any);

      // Act
      await productsService.update(productId, updateData as any);

      // Assert - findUnique called only once (for existing product, not for slug check)
      expect(prismaMock.product.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    const productId = 'product-123';

    it('should soft delete product if it has orders (deactivate)', async () => {
      // Arrange
      prismaMock.orderItem.count.mockResolvedValue(3);
      prismaMock.product.update.mockResolvedValue({
        id: productId,
        isActive: false,
      } as any);

      // Act
      const result = await productsService.delete(productId);

      // Assert
      expect(result.message).toBe('Produto desativado (possui pedidos vinculados)');
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { isActive: false },
      });
      expect(prismaMock.product.delete).not.toHaveBeenCalled();
    });

    it('should hard delete product if it has no orders', async () => {
      // Arrange
      prismaMock.orderItem.count.mockResolvedValue(0);
      prismaMock.product.delete.mockResolvedValue({
        id: productId,
      } as any);

      // Act
      const result = await productsService.delete(productId);

      // Assert
      expect(result.message).toBe('Produto excluído com sucesso');
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // CREATE CATEGORY
  // =============================================
  describe('createCategory', () => {
    const createData = {
      name: 'Tarot',
      description: 'Leituras de tarot',
    };

    const mockCategory = {
      id: 'cat-123',
      name: 'Tarot',
      slug: 'tarot',
      description: 'Leituras de tarot',
      isActive: true,
    };

    it('should create category successfully with generated slug', async () => {
      // Arrange
      prismaMock.productCategory.findUnique.mockResolvedValue(null);
      prismaMock.productCategory.create.mockResolvedValue(mockCategory as any);

      // Act
      const result = await productsService.createCategory(createData as any);

      // Assert
      expect(result.id).toBe('cat-123');
      expect(result.slug).toBe('tarot');
      expect(prismaMock.productCategory.findUnique).toHaveBeenCalledWith({
        where: { slug: 'tarot' },
      });
      expect(prismaMock.productCategory.create).toHaveBeenCalledWith({
        data: { ...createData, slug: 'tarot' },
      });
    });

    it('should create category with provided slug', async () => {
      // Arrange
      const dataWithSlug = { ...createData, slug: 'custom-cat' };
      prismaMock.productCategory.findUnique.mockResolvedValue(null);
      prismaMock.productCategory.create.mockResolvedValue({
        ...mockCategory,
        slug: 'custom-cat',
      } as any);

      // Act
      const result = await productsService.createCategory(dataWithSlug as any);

      // Assert
      expect(result.slug).toBe('custom-cat');
      expect(prismaMock.productCategory.findUnique).toHaveBeenCalledWith({
        where: { slug: 'custom-cat' },
      });
    });

    it('should throw conflict error if category slug already exists', async () => {
      // Arrange
      prismaMock.productCategory.findUnique.mockResolvedValue(mockCategory as any);

      // Act & Assert
      await expect(productsService.createCategory(createData as any)).rejects.toThrow(
        'Já existe uma categoria com este slug'
      );
      expect(prismaMock.productCategory.create).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // LIST CATEGORIES
  // =============================================
  describe('listCategories', () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Tarot',
        slug: 'tarot',
        isActive: true,
        displayOrder: 1,
        _count: { products: 5 },
      },
      {
        id: 'cat-2',
        name: 'Astrologia',
        slug: 'astrologia',
        isActive: false,
        displayOrder: 2,
        _count: { products: 3 },
      },
    ];

    it('should list all categories', async () => {
      // Arrange
      prismaMock.productCategory.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await productsService.listCategories();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      });
    });

    it('should list only active categories when activeOnly is true', async () => {
      // Arrange
      const activeOnly = [mockCategories[0]];
      prismaMock.productCategory.findMany.mockResolvedValue(activeOnly as any);

      // Act
      const result = await productsService.listCategories(true);

      // Assert
      expect(result).toEqual(activeOnly);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      });
    });
  });

  // =============================================
  // UPDATE CATEGORY
  // =============================================
  describe('updateCategory', () => {
    const categoryId = 'cat-123';
    const existingCategory = {
      id: categoryId,
      name: 'Tarot',
      slug: 'tarot',
      isActive: true,
    };

    it('should update category successfully', async () => {
      // Arrange
      const updateData = { name: 'Tarot Atualizado' };
      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.update.mockResolvedValue({
        ...existingCategory,
        ...updateData,
      } as any);

      // Act
      const result = await productsService.updateCategory(categoryId, updateData as any);

      // Assert
      expect(result.name).toBe('Tarot Atualizado');
      expect(prismaMock.productCategory.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: updateData,
      });
    });

    it('should update category slug when unique', async () => {
      // Arrange
      const updateData = { slug: 'novo-slug' };
      prismaMock.productCategory.findUnique
        .mockResolvedValueOnce(existingCategory as any) // existing category
        .mockResolvedValueOnce(null); // slug check
      prismaMock.productCategory.update.mockResolvedValue({
        ...existingCategory,
        slug: 'novo-slug',
      } as any);

      // Act
      const result = await productsService.updateCategory(categoryId, updateData as any);

      // Assert
      expect(result.slug).toBe('novo-slug');
    });

    it('should throw not found error if category does not exist', async () => {
      // Arrange
      prismaMock.productCategory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        productsService.updateCategory(categoryId, { name: 'test' } as any)
      ).rejects.toThrow('Categoria');
      expect(prismaMock.productCategory.update).not.toHaveBeenCalled();
    });

    it('should throw conflict error if new slug already exists', async () => {
      // Arrange
      const updateData = { slug: 'existing-slug' };
      prismaMock.productCategory.findUnique
        .mockResolvedValueOnce(existingCategory as any) // existing category
        .mockResolvedValueOnce({ id: 'other-cat', slug: 'existing-slug' } as any); // slug collision

      // Act & Assert
      await expect(
        productsService.updateCategory(categoryId, updateData as any)
      ).rejects.toThrow('Já existe uma categoria com este slug');
      expect(prismaMock.productCategory.update).not.toHaveBeenCalled();
    });

    it('should skip slug uniqueness check if slug unchanged', async () => {
      // Arrange
      const updateData = { slug: 'tarot' };
      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory as any);
      prismaMock.productCategory.update.mockResolvedValue(existingCategory as any);

      // Act
      await productsService.updateCategory(categoryId, updateData as any);

      // Assert - findUnique called only once (for existing category, not for slug check)
      expect(prismaMock.productCategory.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================
  // DELETE CATEGORY
  // =============================================
  describe('deleteCategory', () => {
    const categoryId = 'cat-123';

    it('should delete category successfully if no products linked', async () => {
      // Arrange
      prismaMock.product.count.mockResolvedValue(0);
      prismaMock.productCategory.delete.mockResolvedValue({
        id: categoryId,
      } as any);

      // Act
      const result = await productsService.deleteCategory(categoryId);

      // Assert
      expect(result.message).toBe('Categoria excluída com sucesso');
      expect(prismaMock.productCategory.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should throw conflict error if category has products', async () => {
      // Arrange
      prismaMock.product.count.mockResolvedValue(5);

      // Act & Assert
      await expect(productsService.deleteCategory(categoryId)).rejects.toThrow(
        'Categoria possui produtos vinculados'
      );
      expect(prismaMock.productCategory.delete).not.toHaveBeenCalled();
    });
  });
});
