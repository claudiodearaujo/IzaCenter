// apps/backend/src/modules/products/products.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { ProductsController } from './products.controller';
import { productsService } from './products.service';

// Mock the products service
jest.mock('./products.service', () => ({
  productsService: {
    list: jest.fn(),
    getFeatured: jest.fn(),
    getBySlug: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    updateCoverImage: jest.fn(),
    delete: jest.fn(),
    createCategory: jest.fn(),
    listCategories: jest.fn(),
    getCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  },
}));

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  file: undefined,
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('ProductsController', () => {
  let controller: ProductsController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new ProductsController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // PUBLIC ROUTES
  // =============================================
  describe('listPublic', () => {
    it('should return list of active products', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'Product 1' }],
        meta: { total: 1, page: 1, limit: 10 },
      };
      req.query = {};
      (productsService.list as jest.Mock).mockResolvedValue(mockResult);

      await controller.listPublic(req as Request, res as Response, mockNext);

      expect(productsService.list).toHaveBeenCalledWith({}, true);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        meta: mockResult.meta,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (productsService.list as jest.Mock).mockRejectedValue(error);

      await controller.listPublic(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getFeatured', () => {
    it('should return featured products with default limit', async () => {
      const mockProducts = [{ id: '1', name: 'Featured' }];
      req.query = {};
      (productsService.getFeatured as jest.Mock).mockResolvedValue(mockProducts);

      await controller.getFeatured(req as Request, res as Response, mockNext);

      expect(productsService.getFeatured).toHaveBeenCalledWith(6);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
      });
    });

    it('should use custom limit from query', async () => {
      req.query = { limit: '3' };
      (productsService.getFeatured as jest.Mock).mockResolvedValue([]);

      await controller.getFeatured(req as Request, res as Response, mockNext);

      expect(productsService.getFeatured).toHaveBeenCalledWith(3);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (productsService.getFeatured as jest.Mock).mockRejectedValue(error);

      await controller.getFeatured(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = { id: '1', slug: 'product-1', name: 'Product 1' };
      req.params = { slug: 'product-1' };
      (productsService.getBySlug as jest.Mock).mockResolvedValue(mockProduct);

      await controller.getBySlug(req as Request, res as Response, mockNext);

      expect(productsService.getBySlug).toHaveBeenCalledWith('product-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('should call next with error if product not found', async () => {
      const error = new Error('Produto não encontrado');
      req.params = { slug: 'nonexistent' };
      (productsService.getBySlug as jest.Mock).mockRejectedValue(error);

      await controller.getBySlug(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN ROUTES
  // =============================================
  describe('create', () => {
    it('should create product and return 201', async () => {
      const createData = { name: 'New Product', price: 99.9, categoryId: 'cat-1' };
      const mockProduct = { id: 'prod-1', ...createData };
      req.body = createData;
      (productsService.create as jest.Mock).mockResolvedValue(mockProduct);

      await controller.create(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produto criado com sucesso',
        data: mockProduct,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Validation error');
      req.body = {};
      (productsService.create as jest.Mock).mockRejectedValue(error);

      await controller.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('list', () => {
    it('should return all products for admin', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }],
        meta: { total: 2, page: 1, limit: 10 },
      };
      req.query = {};
      (productsService.list as jest.Mock).mockResolvedValue(mockResult);

      await controller.list(req as Request, res as Response, mockNext);

      expect(productsService.list).toHaveBeenCalledWith({}, false);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getById', () => {
    it('should return product by ID', async () => {
      const mockProduct = { id: 'prod-1', name: 'Product' };
      req.params = { id: 'prod-1' };
      (productsService.getById as jest.Mock).mockResolvedValue(mockProduct);

      await controller.getById(req as Request, res as Response, mockNext);

      expect(productsService.getById).toHaveBeenCalledWith('prod-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('should call next with error if not found', async () => {
      const error = new Error('Produto não encontrado');
      req.params = { id: 'nonexistent' };
      (productsService.getById as jest.Mock).mockRejectedValue(error);

      await controller.getById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update product and return success', async () => {
      const updateData = { name: 'Updated Product', price: 149.9 };
      const mockProduct = { id: 'prod-1', ...updateData };
      req.params = { id: 'prod-1' };
      req.body = updateData;
      (productsService.update as jest.Mock).mockResolvedValue(mockProduct);

      await controller.update(req as Request, res as Response, mockNext);

      expect(productsService.update).toHaveBeenCalledWith('prod-1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: mockProduct,
      });
    });
  });

  describe('updateCover', () => {
    it('should update cover image when file is provided', async () => {
      const mockFile = { originalname: 'cover.jpg', buffer: Buffer.from('') } as Express.Multer.File;
      const mockProduct = { id: 'prod-1', coverUrl: 'https://example.com/cover.jpg' };
      req.params = { id: 'prod-1' };
      (req as any).file = mockFile;
      (productsService.updateCoverImage as jest.Mock).mockResolvedValue(mockProduct);

      await controller.updateCover(req as Request, res as Response, mockNext);

      expect(productsService.updateCoverImage).toHaveBeenCalledWith('prod-1', mockFile);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Imagem atualizada com sucesso',
        data: mockProduct,
      });
    });

    it('should return 400 if no file provided', async () => {
      req.params = { id: 'prod-1' };
      (req as any).file = undefined;

      await controller.updateCover(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    });
  });

  describe('delete', () => {
    it('should delete product and return success message', async () => {
      req.params = { id: 'prod-1' };
      (productsService.delete as jest.Mock).mockResolvedValue({
        message: 'Produto excluído com sucesso',
      });

      await controller.delete(req as Request, res as Response, mockNext);

      expect(productsService.delete).toHaveBeenCalledWith('prod-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produto excluído com sucesso',
      });
    });

    it('should call next with error if product not found', async () => {
      const error = new Error('Produto não encontrado');
      req.params = { id: 'nonexistent' };
      (productsService.delete as jest.Mock).mockRejectedValue(error);

      await controller.delete(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CATEGORIES
  // =============================================
  describe('createCategory', () => {
    it('should create category and return 201', async () => {
      const createData = { name: 'New Category', slug: 'new-category' };
      const mockCategory = { id: 'cat-1', ...createData };
      req.body = createData;
      (productsService.createCategory as jest.Mock).mockResolvedValue(mockCategory);

      await controller.createCategory(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Categoria criada com sucesso',
        data: mockCategory,
      });
    });
  });

  describe('listCategories', () => {
    it('should return all categories for admin', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Category 1' }];
      (productsService.listCategories as jest.Mock).mockResolvedValue(mockCategories);

      await controller.listCategories(req as Request, res as Response, mockNext);

      expect(productsService.listCategories).toHaveBeenCalledWith(false);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCategories,
      });
    });
  });

  describe('listCategoriesPublic', () => {
    it('should return only active categories for public', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Category 1', isActive: true }];
      (productsService.listCategories as jest.Mock).mockResolvedValue(mockCategories);

      await controller.listCategoriesPublic(req as Request, res as Response, mockNext);

      expect(productsService.listCategories).toHaveBeenCalledWith(true);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCategories,
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', async () => {
      const mockCategory = { id: 'cat-1', name: 'Category' };
      req.params = { id: 'cat-1' };
      (productsService.getCategoryById as jest.Mock).mockResolvedValue(mockCategory);

      await controller.getCategoryById(req as Request, res as Response, mockNext);

      expect(productsService.getCategoryById).toHaveBeenCalledWith('cat-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCategory,
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category and return success', async () => {
      const updateData = { name: 'Updated Category' };
      const mockCategory = { id: 'cat-1', ...updateData };
      req.params = { id: 'cat-1' };
      req.body = updateData;
      (productsService.updateCategory as jest.Mock).mockResolvedValue(mockCategory);

      await controller.updateCategory(req as Request, res as Response, mockNext);

      expect(productsService.updateCategory).toHaveBeenCalledWith('cat-1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: mockCategory,
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category and return success message', async () => {
      req.params = { id: 'cat-1' };
      (productsService.deleteCategory as jest.Mock).mockResolvedValue({
        message: 'Categoria excluída com sucesso',
      });

      await controller.deleteCategory(req as Request, res as Response, mockNext);

      expect(productsService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Categoria excluída com sucesso',
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Categoria não encontrada');
      req.params = { id: 'nonexistent' };
      (productsService.deleteCategory as jest.Mock).mockRejectedValue(error);

      await controller.deleteCategory(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
