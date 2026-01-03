// apps/backend/src/modules/products/products.service.ts

import { prisma } from '../../config/database';
import { storage } from '../../config/supabase';
import { Errors } from '../../middlewares/error.middleware';
import { generateSlug, generateFileName, buildPaginationMeta } from '../../utils';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './products.schema';

export class ProductsService {
  // =============================================
  // PRODUCTS
  // =============================================

  /**
   * Create a new product
   */
  async create(data: CreateProductDto) {
    const slug = data.slug || generateSlug(data.name);

    // Check if slug exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw Errors.Conflict('Já existe um produto com este slug');
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
        attachments: true,
      },
    });

    return product;
  }

  /**
   * Get product by ID
   */
  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        attachments: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw Errors.NotFound('Produto');
    }

    return product;
  }

  /**
   * Get product by slug (public)
   */
  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        attachments: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw Errors.NotFound('Produto');
    }

    return product;
  }

  /**
   * List products
   */
  async list(query: QueryProductsDto, publicOnly: boolean = false) {
    const {
      page,
      limit,
      search,
      categoryId,
      productType,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = query;

    const where: any = {};

    if (publicOnly) {
      where.isActive = true;
      // Check availability dates
      const now = new Date();
      where.OR = [
        { availableFrom: null },
        { availableFrom: { lte: now } },
      ];
      where.AND = [
        {
          OR: [
            { availableUntil: null },
            { availableUntil: { gte: now } },
          ],
        },
      ];
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (productType) {
      where.productType = productType;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (typeof isFeatured === 'boolean') {
      where.isFeatured = isFeatured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 6) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return products;
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDto) {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw Errors.NotFound('Produto');
    }

    // If updating slug, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        throw Errors.Conflict('Já existe um produto com este slug');
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        attachments: true,
      },
    });

    return product;
  }

  /**
   * Update product cover image
   */
  async updateCoverImage(id: string, file: Express.Multer.File) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { coverImageUrl: true },
    });

    if (!product) {
      throw Errors.NotFound('Produto');
    }

    // Delete old cover if exists
    if (product.coverImageUrl) {
      const oldPath = product.coverImageUrl.split('/').slice(-2).join('/');
      await storage.delete(`products/${oldPath}`).catch(console.error);
    }

    // Upload new cover
    const fileName = generateFileName(file.originalname);
    const filePath = `products/${id}/${fileName}`;

    await storage.upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    const coverImageUrl = storage.getPublicUrl(filePath);

    const updated = await prisma.product.update({
      where: { id },
      data: { coverImageUrl },
      select: { id: true, coverImageUrl: true },
    });

    return updated;
  }

  /**
   * Delete product
   */
  async delete(id: string) {
    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      // Soft delete - just deactivate
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Produto desativado (possui pedidos vinculados)' };
    }

    // Hard delete
    await prisma.product.delete({ where: { id } });
    return { message: 'Produto excluído com sucesso' };
  }

  // =============================================
  // CATEGORIES
  // =============================================

  /**
   * Create category
   */
  async createCategory(data: CreateCategoryDto) {
    const slug = data.slug || generateSlug(data.name);

    const existingSlug = await prisma.productCategory.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw Errors.Conflict('Já existe uma categoria com este slug');
    }

    const category = await prisma.productCategory.create({
      data: { ...data, slug },
    });

    return category;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw Errors.NotFound('Categoria');
    }

    return category;
  }

  /**
   * List categories
   */
  async listCategories(activeOnly: boolean = false) {
    const where = activeOnly ? { isActive: true } : {};

    const categories = await prisma.productCategory.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return categories;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryDto) {
    const existing = await prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      throw Errors.NotFound('Categoria');
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.productCategory.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        throw Errors.Conflict('Já existe uma categoria com este slug');
      }
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data,
    });

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw Errors.Conflict('Categoria possui produtos vinculados');
    }

    await prisma.productCategory.delete({ where: { id } });
    return { message: 'Categoria excluída com sucesso' };
  }
}

export const productsService = new ProductsService();
