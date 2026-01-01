import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ProductsService } from './products.service';
import { Decimal } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Mock Prisma Client
const mockPrismaService = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return an array of products', async () => {
      const expectedData = [
        { id: '1', title: 'Product 1', price: new Decimal(10) },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(expectedData);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.list({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: expectedData,
        meta: { total: expect.any(Number), page: 1, limit: 10, totalPages: expect.any(Number) },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single product if found', async () => {
      const product = { id: '1', title: 'Product 1' };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.findOne('1');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const updatedProduct = { id: '1', title: 'Updated' };
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', { title: 'Updated' });
      expect(result).toEqual(updatedProduct);
    });
  });
});