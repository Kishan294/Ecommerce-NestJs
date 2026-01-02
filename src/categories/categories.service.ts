import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { Prisma } from 'src/generated/prisma/client';

/**
 * Service for handling category-related business logic and database operations.
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lists categories with support for searching, filtering by parent, and pagination.
   * @param query Filtering and pagination criteria.
   * @returns A paginated response object.
   */
  async list(query: QueryCategoriesDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc', parentId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId === '' ? null : parentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Finds a single category by its ID.
   * @param id The ID of the category.
   * @returns The category details.
   * @throws NotFoundException if the category is not found.
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Creates a new category.
   * @param dto The category data.
   * @returns The newly created category.
   */
  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
      },
    });
  }

  /**
   * Updates an existing category.
   * @param id The ID of the category.
   * @param dto The update data.
   * @returns The updated category.
   * @throws NotFoundException if the category is not found.
   */
  async update(id: string, dto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw err;
    }
  }

  /**
   * Deletes a category.
   * @param id The ID of the category.
   * @throws NotFoundException if the category is not found.
   */
  async delete(id: string) {
    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw err;
    }
  }
}