import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  const mockOrdersService = {
    checkout: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: '1', role: 'CUSTOMER' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /orders/checkout should create order', () => {
    const mockOrder = { id: 'o1', total: 100 };
    mockOrdersService.checkout.mockResolvedValue(mockOrder);

    return request(app.getHttpServer())
      .post('/orders/checkout')
      .send({
        shippingAddress: { line1: '123', city: 'NY', postalCode: '10001', country: 'USA' },
        paymentMethod: 'cod',
      })
      .expect(201)
      .expect(mockOrder);
  });

  afterAll(async () => {
    await app.close();
  });
});