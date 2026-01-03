// apps/backend/src/modules/categories/categories.service.ts

import { prisma } from '../../config/database';
import { NotFoundException, BadRequestException } from '../../utils/errors';
import { generateSlug } from '../../utils';

interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export class CategoriesService {
  async findAll(includeInactive = false) {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.productCategory.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return { data: categories };
  }

  async findById(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return { data: category };
  }

  async findBySlug(slug: string) {
    const category = await prisma.productCategory.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return { data: category };
  }

  async create(data: CreateCategoryDTO) {
    const slug = generateSlug(data.name);

    const existingSlug = await prisma.productCategory.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new BadRequestException('Já existe uma categoria com este nome');
    }

    // Get max order
    const maxOrder = await prisma.productCategory.aggregate({
      _max: { displayOrder: true },
    });

    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder || 0) + 1,
        isActive: data.isActive ?? true,
      },
    });

    return { data: category };
  }

  async update(id: string, data: UpdateCategoryDTO) {
    const category = await prisma.productCategory.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const updateData: any = { ...data };

    if (data.name && data.name !== category.name) {
      updateData.slug = generateSlug(data.name);

      const existingSlug = await prisma.productCategory.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        throw new BadRequestException('Já existe uma categoria com este nome');
      }
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: updateData,
    });

    return { data: updated };
  }

  async reorder(id: string, newOrder: number) {
    const category = await prisma.productCategory.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const oldOrder = category.displayOrder;

    // Update other categories' order
    if (newOrder < oldOrder) {
      // Moving up
      await prisma.productCategory.updateMany({
        where: {
          displayOrder: {
            gte: newOrder,
            lt: oldOrder,
          },
        },
        data: {
          displayOrder: { increment: 1 },
        },
      });
    } else {
      // Moving down
      await prisma.productCategory.updateMany({
        where: {
          displayOrder: {
            gt: oldOrder,
            lte: newOrder,
          },
        },
        data: {
          displayOrder: { decrement: 1 },
        },
      });
    }

    // Update the category's order
    const updated = await prisma.productCategory.update({
      where: { id },
      data: { displayOrder: newOrder },
    });

    return { data: updated };
  }

  async delete(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Esta categoria possui ${category._count.products} produto(s) vinculado(s). Remova-os primeiro.`
      );
    }

    await prisma.productCategory.delete({ where: { id } });

    // Reorder remaining categories
    await prisma.productCategory.updateMany({
      where: {
        displayOrder: { gt: category.displayOrder },
      },
      data: {
        displayOrder: { decrement: 1 },
      },
    });

    return { message: 'Categoria excluída com sucesso' };
  }
}

export const categoriesService = new CategoriesService();
