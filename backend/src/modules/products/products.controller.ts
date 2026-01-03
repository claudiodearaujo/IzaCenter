// apps/backend/src/modules/products/products.controller.ts

import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './products.schema';

export class ProductsController {
  // =============================================
  // PUBLIC ROUTES
  // =============================================

  /**
   * GET /products/public
   * List active products (public)
   */
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as QueryProductsDto;
      const result = await productsService.list(query, true);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/public/featured
   * Get featured products
   */
  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const products = await productsService.getFeatured(limit);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/public/:slug
   * Get product by slug (public)
   */
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productsService.getBySlug(slug);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/categories/public
   * List active categories (public)
   */
  async listCategoriesPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productsService.listCategories(true);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // ADMIN ROUTES
  // =============================================

  /**
   * POST /products
   * Create product
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateProductDto;
      const product = await productsService.create(data);

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products
   * List all products (admin)
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as QueryProductsDto;
      const result = await productsService.list(query, false);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:id
   * Get product by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.getById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /products/:id
   * Update product
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProductDto;
      const product = await productsService.update(id, data);

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /products/:id/cover
   * Update product cover image
   */
  async updateCover(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado',
        });
        return;
      }

      const product = await productsService.updateCoverImage(id, req.file);

      res.json({
        success: true,
        message: 'Imagem atualizada com sucesso',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:id
   * Delete product
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productsService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // CATEGORIES
  // =============================================

  /**
   * POST /products/categories
   * Create category
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateCategoryDto;
      const category = await productsService.createCategory(data);

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/categories
   * List all categories (admin)
   */
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productsService.listCategories(false);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/categories/:id
   * Get category by ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await productsService.getCategoryById(id);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /products/categories/:id
   * Update category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateCategoryDto;
      const category = await productsService.updateCategory(id, data);

      res.json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/categories/:id
   * Delete category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productsService.deleteCategory(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
