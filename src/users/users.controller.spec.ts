import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const mockUsersService = {
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: '1', email: 'test@test.com', role: 'ADMIN' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /users/me should return user', () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    mockUsersService.findById.mockResolvedValue(mockUser);

    return request(app.getHttpServer())
      .get('/users/me')
      .expect(200)
      .expect(mockUser);
  });

  it('GET /users should return all users', () => {
    const mockUsers = [{ id: '1', email: 'test@test.com' }];
    mockUsersService.findAll.mockResolvedValue(mockUsers);

    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect(mockUsers);
  });

  afterAll(async () => {
    await app.close();
  });
});