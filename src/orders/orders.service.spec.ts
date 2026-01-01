import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { Decimal } from '@prisma/client/runtime/client';

// Mock PrismaService
const mockPrismaService = {
  cart: {
    findUnique: jest.fn(),
  },
  order: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
  },
  cartItem: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

// Mock CartService
const mockCartService = {
  getCart: jest.fn(),
  clearCart: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should create an order successfully', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [
          {
            productId: 'p1',
            product: { id: 'p1', title: 'Product 1', price: new Decimal(10), stock: 10 },
            quantity: 2,
          },
        ],
      };
      const mockOrder = { id: 'o1', total: new Decimal(20) };

      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.product.findUnique.mockResolvedValue({ stock: 10 });
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.create.mockResolvedValue({});
      mockPrismaService.product.update.mockResolvedValue({});
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({});

      const result = await service.checkout('u1', {
        shippingAddress: { line1: '123', city: 'NY', postalCode: '10001', country: 'USA' },
        paymentMethod: 'cod',
      });

      expect(result).toEqual(mockOrder);
    });
  });
});