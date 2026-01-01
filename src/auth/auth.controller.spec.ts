import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn().mockImplementation((dto) => {
    return Promise.resolve({
      id: 'mock-id',
      email: dto.email,
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }),
  login: jest.fn().mockImplementation((user) => {
    return Promise.resolve({
      access_token: 'mock-jwt-token',
    });
  }),
  validateUser: jest.fn().mockImplementation((email, pass) => {
    if (email === 'test@example.com' && pass === 'password123') {
       return Promise.resolve({
        id: 'mock-id',
        email: email,
        role: 'CUSTOMER',
       });
    }
    return Promise.resolve(null);
  }),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(AuthService)
    .useValue(mockAuthService)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Ensure ValidationPipe is active
    await app.init();
  });

  it('POST /auth/register should create a user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'test@example.com');
        expect(res.body).not.toHaveProperty('passwordHash'); // Security check
      });
  });

  it('POST /auth/register should fail with weak password', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123', // Too short
      })
      .expect(400); // Validation Error
  });

  it('POST /auth/login should return JWT token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com', 
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});