import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Prisma } from 'src/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

/**
 * Service for handling product-related business logic and database operations.
 * Implements caching for individual product lookups.
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  /**
   * Builds the 'where' clause for Prisma queries based on filters.
   * @param query The query parameters.
   * @returns A Prisma ProductWhereInput object.
   */
  private buildWhere(query: QueryProductsDto): Prisma.ProductWhereInput {
    const { search, categoryId, minPrice, maxPrice, inStockOnly } = query;
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Decimal(maxPrice);
      }
    }

    if (inStockOnly === 1) {
      where.stock = { gt: 0 };
    }

    return where;
  }

  /**
   * Lists products with support for searching, filtering, and pagination.
   * @param query Filtering and pagination criteria.
   * @returns A paginated response object.
   */
  async list(query: QueryProductsDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Finds a product by ID, with caching.
   * @param id The ID of the product.
   * @returns The product details.
   * @throws NotFoundException if the product is not found.
   */
  async findOne(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.cacheManager.set(cacheKey, product, 60); // cache 60 seconds
    return product;
  }

  /**
   * Creates a new product.
   * @param dto The product creation data.
   * @returns The created product.
   * @throws NotFoundException if the category ID is invalid.
   */
  async create(dto: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          sku: dto.sku,
          category: {
            connect: { id: dto.categoryId },
          },
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      return product;
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
      }
      throw err;
    }
  }

  /**
   * Updates an existing product and clears its cache.
   * @param id The ID of the product.
   * @param dto The update data.
   * @returns The updated product.
   * @throws NotFoundException if the product is not found.
   */
  async update(id: string, dto: UpdateProductDto) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          sku: dto.sku,
          category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      await this.cacheManager.del(`product:${id}`);
      return product;
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
      throw err;
    }
  }

  /**
   * Deletes a product and clears its cache.
   * @param id The ID of the product.
   * @throws NotFoundException if the product is not found.
   */
  async delete(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
      await this.cacheManager.del(`product:${id}`);
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
      throw err;
    }
  }

  /**
   * Updates the image URL for a product.
   * @param id The ID of the product.
   * @param imageUrl The new image URL.
   * @returns The updated product.
   * @throws NotFoundException if the product is not found.
   */
  async updateImageUrl(id: string, imageUrl: string) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: { imageUrl },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
      throw err;
    }
  }
}