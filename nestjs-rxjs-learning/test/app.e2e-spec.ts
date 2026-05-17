/**
 * KHÁI NIỆM: E2E (End-to-End) Test
 *
 * TẠI SAO cần E2E test:
 * 1. Integration: Test toàn bộ pipeline (middleware → guard → pipe → controller → service → DB)
 * 2. Realistic: Giống client thật gọi API
 * 3. Confidence: Đảm bảo các module hoạt động cùng nhau
 *
 * KHÁC Unit Test:
 * - Unit: Mock dependencies, test 1 unit
 * - E2E: Real app instance, test full flow
 *
 * TOOL: supertest - HTTP assertion library
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('App E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;

  /**
   * beforeAll: Chạy 1 LẦN trước tất cả tests
   * Tạo real NestJS app instance với full module tree
   *
   * TẠI SAO beforeAll thay vì beforeEach:
   * - Tạo app tốn thời gian (DB connection, module init)
   * - Chỉ cần 1 instance cho tất cả tests
   * - Tests dùng chung DB state (seeded data)
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  /**
   * TEST: Health Check
   */
  describe('Health', () => {
    it('GET /health → 200 + database up', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.status).toBe('ok');
          expect(res.body.data.info.database.status).toBe('up');
        });
    });
  });

  /**
   * TEST: Auth Flow
   * Register → Login → Access protected route
   */
  describe('Auth Flow', () => {
    const testUser = {
      email: 'e2e-test@example.com',
      password: 'test123456',
      name: 'E2E Tester',
    };

    it('POST /api/v1/auth/register → 201 + tokens', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
          expect(res.body.data.tokenType).toBe('Bearer');
          accessToken = res.body.data.accessToken;
        });
    });

    it('POST /api/v1/auth/login → 201 + tokens', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.accessToken).toBeDefined();
          accessToken = res.body.data.accessToken;
        });
    });

    it('GET /api/v1/tasks without token → 401', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(401);
    });

    it('GET /api/v1/tasks with token → 200', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  /**
   * TEST: Tasks CRUD
   */
  describe('Tasks CRUD', () => {
    let taskId: number;

    it('POST /api/v1/tasks → create task', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'E2E Test Task', description: 'Created by E2E test' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.title).toBe('E2E Test Task');
          expect(res.body.data.status).toBe('TODO');
          taskId = res.body.data.id;
        });
    });

    it('GET /api/v1/tasks/:id → get task', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(taskId);
        });
    });

    it('PATCH /api/v1/tasks/:id → update task', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title', status: 'IN_PROGRESS' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toBe('Updated Title');
          expect(res.body.data.status).toBe('IN_PROGRESS');
        });
    });

    it('DELETE /api/v1/tasks/:id → soft delete', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  /**
   * TEST: RxJS Learning Endpoints (public, no auth needed)
   */
  describe('RxJS Examples', () => {
    it('GET /api/v1/rxjs/observable-vs-promise → lesson response', () => {
      return request(app.getHttpServer())
        .get('/api/v1/rxjs/observable-vs-promise')
        .expect(200)
        .expect((res) => {
          const lesson = res.body.data;
          expect(lesson.concept).toBeDefined();
          expect(lesson.explanation).toBeDefined();
          expect(lesson.codeExample).toBeDefined();
          expect(lesson.result).toBeDefined();
          expect(lesson.commonMistakes).toBeInstanceOf(Array);
          expect(lesson.whenToUse).toBeDefined();
        });
    });

    it('GET /api/v1/rxjs/pipe-operators → result = 300', () => {
      return request(app.getHttpServer())
        .get('/api/v1/rxjs/pipe-operators')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.result.finalReduce).toBe(300);
        });
    });

    it('GET /api/v1/rxjs/subjects → subject types explained', () => {
      return request(app.getHttpServer())
        .get('/api/v1/rxjs/subjects')
        .expect(200)
        .expect((res) => {
          const data = res.body.data;
          expect(data.result.subject).toBeDefined();
          expect(data.result.behaviorSubject).toBeDefined();
          expect(data.result.replaySubject).toBeDefined();
        });
    });
  });

  /**
   * TEST: Validation (class-validator)
   */
  describe('Validation', () => {
    it('POST /api/v1/auth/register with invalid email → 400', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: '123', name: '' })
        .expect(400);
    });

    it('POST /api/v1/tasks without title → 400', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'No title' })
        .expect(400);
    });
  });
});
