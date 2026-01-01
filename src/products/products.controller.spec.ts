import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { ProductsService } from './products.service';

// Mock Product Data
const mockProduct = {
  id: '1',
  title: 'Test Product',
  price: '10.00',
  stock: 10,
};

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProductsService) // Override Service with Mock
      .useValue({
        list: jest.fn().mockResolvedValue({
          data: [mockProduct],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
        findOne: jest.fn().mockResolvedValue(mockProduct),
        create: jest.fn().mockResolvedValue(mockProduct),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate a mock Admin Token for testing protected routes
    jwtService = app.get(JwtService);
    const payload = { email: 'admin@test.com', sub: '1', role: 'ADMIN' };
    authToken = jwtService.sign(payload);
  });

  it('GET /products should return products (Public)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
      });
  });

  it('GET /products/:id should return single product (Public)', () => {
    return request(app.getHttpServer())
      .get('/products/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', '1');
      });
  });

  it('POST /products should create product (Admin Only)', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Product',
        slug: 'new-product',
        price: 20,
        stock: 50,
        categoryId: 'cat-id',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('title', 'Test Product');
      });
  });

  it('POST /products should fail without token', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        title: 'New Product',
      })
      .expect(401); // Unauthorized
  });

  afterAll(async () => {
    await app.close();
  });
});