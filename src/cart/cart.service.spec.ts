import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/client';

// Mock PrismaService
const mockPrismaService = {
  cart: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  cartItem: {
    upsert: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart', async () => {
      const mockCart = { id: '1', userId: '123' };
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart('123');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      const mockCart = { id: '1', userId: '123' };
      const mockProduct = { id: 'prod1', stock: 10, price: new Decimal(10) };
      const mockItem = { id: 'item1', quantity: 1 };

      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.upsert.mockResolvedValue(mockItem);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      await service.addItem('123', { productId: 'prod1', quantity: 1 });
      expect(mockPrismaService.product.findUnique).toHaveBeenCalled();
    });
  });
});