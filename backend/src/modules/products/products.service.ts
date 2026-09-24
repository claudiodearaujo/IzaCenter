// apps/backend/src/modules/products/products.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { storage } from '../../config/supabase';
import { DEFAULT_TENANT_ID } from '../tenant/tenant.constants';
import { Errors } from '../../middlewares/error.middleware';
import { generateSlug, generateFileName, buildPaginationMeta, buildCursorMeta } from '../../utils';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ServiceCapabilities,
} from './products.schema';

export class ProductsService {
  private async assertCategoryInTenant(categoryId: string | null | undefined, tenantId: string) {
    if (!categoryId) return;
    const category = await prisma.productCategory.findFirst({
      where: { id: categoryId, tenantId },
      select: { id: true },
    });
    if (!category) {
      throw Errors.NotFound('Categoria');
    }
  }

  private legacyTypeFromServiceKind(serviceKind: string): 'QUESTION' | 'SESSION' | 'MONTHLY' | 'SPECIAL' {
    switch (serviceKind) {
      case 'SESSION':
        return 'SESSION';
      case 'PACKAGE':
        return 'MONTHLY';
      case 'ASYNC_SERVICE':
        return 'QUESTION';
      default:
        return 'SPECIAL';
    }
  }

  private serviceKindFromLegacy(productType?: string): string {
    switch (productType) {
      case 'SESSION':
        return 'SESSION';
      case 'MONTHLY':
        return 'PACKAGE';
      case 'QUESTION':
        return 'ASYNC_SERVICE';
      default:
        return 'SERVICE';
    }
  }

  private normalizeCapabilities(product: any): ServiceCapabilities {
    const stored = (product.capabilities || {}) as ServiceCapabilities;
    const durationMinutes = product.sessionDurationMinutes ?? stored.scheduling?.durationMinutes;
    const maxQuestions = product.numQuestions ?? stored.intake?.maxQuestions;
    const specialtyConfig = (stored.specialtyModule?.config || {}) as Record<string, unknown>;

    const capabilities: ServiceCapabilities = {
      ...stored,
      scheduling: {
        ...stored.scheduling,
        enabled: product.requiresScheduling ?? stored.scheduling?.enabled ?? false,
        ...(durationMinutes != null ? { durationMinutes } : {}),
      },
      intake: {
        ...stored.intake,
        enabled: product.numQuestions != null || stored.intake?.enabled === true,
        ...(maxQuestions != null ? { maxQuestions } : {}),
      },
    };

    if (product.numCards != null) {
      capabilities.specialtyModule = {
        key: stored.specialtyModule?.key || 'tarot-cards',
        config: { ...specialtyConfig, numCards: product.numCards },
      };
    }

    return capabilities;
  }

  private toServiceProduct(product: any) {
    return {
      ...product,
      serviceKind: product.serviceKind || this.serviceKindFromLegacy(product.productType),
      capabilities: this.normalizeCapabilities(product),
    };
  }

  private buildPersistenceData(data: CreateProductDto | UpdateProductDto, existing?: any) {
    const serviceKind = data.serviceKind || existing?.serviceKind || this.serviceKindFromLegacy(data.productType || existing?.productType);
    const capabilities = data.capabilities || existing?.capabilities || {};
    const scheduling = capabilities.scheduling;
    const intake = capabilities.intake;
    const specialtyModule = capabilities.specialtyModule;
    const specialtyConfig = (specialtyModule?.config || {}) as Record<string, unknown>;

    return {
      ...data,
      serviceKind,
      productType: data.productType || existing?.productType || this.legacyTypeFromServiceKind(serviceKind),
      capabilities,
      requiresScheduling: scheduling?.enabled ?? data.requiresScheduling ?? existing?.requiresScheduling ?? false,
      sessionDurationMinutes: scheduling?.durationMinutes ?? data.sessionDurationMinutes ?? existing?.sessionDurationMinutes,
      numQuestions: intake?.maxQuestions ?? data.numQuestions ?? existing?.numQuestions,
      numCards: typeof specialtyConfig['numCards'] === 'number'
        ? specialtyConfig['numCards']
        : data.numCards ?? existing?.numCards,
    };
  }

  // =============================================
  // PRODUCTS
  // =============================================

  /**
   * Create a new product
   */
  async create(data: CreateProductDto, tenantId = DEFAULT_TENANT_ID) {
    const slug = data.slug || generateSlug(data.name);

    // Check if slug exists
    const existingSlug = await prisma.product.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });

    if (existingSlug) {
      throw Errors.Conflict('Já existe um produto com este slug');
    }

    const persistenceData = this.buildPersistenceData(data);
    await this.assertCategoryInTenant(persistenceData.categoryId, tenantId);

    const product = await prisma.product.create({
      data: {
        ...persistenceData,
        tenantId,
        slug,
      } as Prisma.ProductUncheckedCreateInput,
      include: {
        category: true,
        attachments: true,
      },
    });

    return this.toServiceProduct(product);
  }

  /**
   * Get product by ID
   */
  async getById(id: string, tenantId = DEFAULT_TENANT_ID) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
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

    return this.toServiceProduct(product);
  }

  /**
   * Get product by slug (public)
   */
  async getBySlug(slug: string, tenantId = DEFAULT_TENANT_ID) {
    const product = await prisma.product.findFirst({
      where: { tenantId, slug, isActive: true },
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

    return this.toServiceProduct(product);
  }

  /**
   * List products
   */
  async list(query: QueryProductsDto, publicOnly: boolean = false, tenantId = DEFAULT_TENANT_ID) {
    const {
      page,
      limit,
      search,
      categoryId,
      productType,
      serviceKind,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = query;

    const where: any = { tenantId };

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

    if (serviceKind) {
      where.serviceKind = serviceKind;
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
      data: products.map((product) => this.toServiceProduct(product)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 6, tenantId = DEFAULT_TENANT_ID) {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
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

    return products.map((product) => this.toServiceProduct(product));
  }

  /**
   * List public products with cursor-based pagination
   * More efficient than offset pagination for large datasets.
   */
  async listCursor(opts: {
    cursor?: string;
    limit?: number;
    search?: string;
    categoryId?: string;
  }, tenantId = DEFAULT_TENANT_ID) {
    const { cursor, limit = 12, search, categoryId } = opts;

    const where: any = { tenantId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      take: limit + 1, // fetch one extra to determine hasNextPage
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const hasNextPage = products.length > limit;
    const data = hasNextPage ? products.slice(0, limit) : products;
    const { nextCursor } = buildCursorMeta(data, limit);

    return {
      data: data.map((product) => this.toServiceProduct(product)),
      meta: { hasNextPage, nextCursor },
    };
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDto, tenantId = DEFAULT_TENANT_ID) {
    // Check if product exists
    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw Errors.NotFound('Produto');
    }

    // If updating slug, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: { tenantId, slug: data.slug, id: { not: id } },
      });
      if (existingSlug) {
        throw Errors.Conflict('Já existe um produto com este slug');
      }
    }

    const persistenceData = this.buildPersistenceData(data, existing);
    await this.assertCategoryInTenant(persistenceData.categoryId, tenantId);

    const product = await prisma.product.update({
      where: { id },
      data: persistenceData as Prisma.ProductUncheckedUpdateInput,
      include: {
        category: true,
        attachments: true,
      },
    });

    return this.toServiceProduct(product);
  }

  /**
   * Update product cover image
   */
  async updateCoverImage(id: string, file: Express.Multer.File, tenantId = DEFAULT_TENANT_ID) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      select: { coverImageUrl: true },
    });

    if (!product) {
      throw Errors.NotFound('Produto');
    }

    // Delete old cover if exists
    if (product.coverImageUrl) {
      const oldPath = product.coverImageUrl.split('/').slice(-2).join('/');
      await storage.delete(`products/${oldPath}`).catch(() => console.error('BACKGROUND_OPERATION_FAILED'));
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
  async delete(id: string, tenantId = DEFAULT_TENANT_ID) {
    const existing = await prisma.product.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!existing) {
      throw Errors.NotFound('Produto');
    }

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id, order: { tenantId } },
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
  async createCategory(data: CreateCategoryDto, tenantId = DEFAULT_TENANT_ID) {
    const slug = data.slug || generateSlug(data.name);

    const existingSlug = await prisma.productCategory.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });

    if (existingSlug) {
      throw Errors.Conflict('Já existe uma categoria com este slug');
    }

    return prisma.productCategory.create({
      data: { ...data, tenantId, slug },
    });
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, tenantId = DEFAULT_TENANT_ID) {
    const category = await prisma.productCategory.findFirst({
      where: { id, tenantId },
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
  async listCategories(activeOnly: boolean = false, tenantId = DEFAULT_TENANT_ID) {
    const where = activeOnly ? { tenantId, isActive: true } : { tenantId };
    return prisma.productCategory.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryDto, tenantId = DEFAULT_TENANT_ID) {
    const existing = await prisma.productCategory.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw Errors.NotFound('Categoria');
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.productCategory.findFirst({
        where: { tenantId, slug: data.slug, id: { not: id } },
      });
      if (existingSlug) {
        throw Errors.Conflict('Já existe uma categoria com este slug');
      }
    }

    return prisma.productCategory.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string, tenantId = DEFAULT_TENANT_ID) {
    const productCount = await prisma.product.count({
      where: { categoryId: id, tenantId },
    });

    if (productCount > 0) {
      throw Errors.Conflict('Categoria possui produtos vinculados');
    }

    const category = await prisma.productCategory.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!category) {
      throw Errors.NotFound('Categoria');
    }
    await prisma.productCategory.delete({ where: { id } });
    return { message: 'Categoria excluída com sucesso' };
  }
}

export const productsService = new ProductsService();
