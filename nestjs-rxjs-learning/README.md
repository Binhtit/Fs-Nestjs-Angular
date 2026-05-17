# 🚀 NestJS + RxJS Learning Project

> Dự án học NestJS + RxJS với comment tiếng Việt chi tiết.
> Mỗi file giải thích: **TẠI SAO** viết code thế này, **KHÁI NIỆM** gì, **LỖI PHỔ BIẾN** cần tránh.

## ⚡ Quick Start (Zero Setup)

```bash
# 1. Clone & install
cd nestjs-rxjs-learning
npm install

# 2. Chạy (SQLite, không cần Docker/MySQL)
npm run start:dev

# 3. Mở trình duyệt
# 📚 API Docs: http://localhost:3000/api-docs
# 💚 Health:   http://localhost:3000/health
```

**Admin account (seeded tự động):** `admin@example.com` / `admin123`

## 📖 Learning Roadmap

Đọc theo thứ tự sau để học hiệu quả nhất:

### Level 1: Hiểu NestJS cơ bản
1. `src/main.ts` — Bootstrap flow
2. `src/app.module.ts` — Root module, global providers
3. `src/config/` — Configuration patterns
4. `src/common/decorators/` — Custom decorators
5. `src/common/guards/` — Authentication & Authorization

### Level 2: CRUD + TypeORM
6. `src/modules/users/entities/user.entity.ts` — TypeORM decorators
7. `src/modules/users/dto/` — DTO pattern, validation
8. `src/modules/users/users.service.ts` — Repository pattern
9. `src/modules/auth/` — JWT auth flow (đọc comment step-by-step)

### Level 3: RxJS 🔥
10. `src/common/interceptors/` — RxJS operators trong interceptors
11. `src/modules/tasks/tasks.service.ts` — RxJS trong service layer
12. **`src/modules/rxjs-examples/rxjs-examples.service.ts`** — 9 bài học RxJS chi tiết

### Level 4: Real-time
13. `src/modules/realtime/` — WebSocket + RxJS Subject

## 🎓 RxJS Endpoints (9 bài học)

| # | Endpoint | Concept |
|---|----------|---------|
| 1 | `GET /api/v1/rxjs/observable-vs-promise` | Observable basics |
| 2 | `GET /api/v1/rxjs/pipe-operators` | pipe, map, filter, reduce |
| 3 | `GET /api/v1/rxjs/higher-order-mapping` | mergeMap, switchMap, concatMap, exhaustMap |
| 4 | `GET /api/v1/rxjs/subjects` | Subject, BehaviorSubject, ReplaySubject |
| 5 | `GET /api/v1/rxjs/combining-streams` | combineLatest, forkJoin, zip |
| 6 | `GET /api/v1/rxjs/error-handling` | catchError, retry |
| 7 | `GET /api/v1/rxjs/rate-limiting` | debounceTime, throttleTime |
| 8 | `GET /api/v1/rxjs/unsubscribe-patterns` | takeUntil, takeWhile, take |
| 9 | `GET /api/v1/rxjs/real-world-websocket` | WebSocket + RxJS pattern |

## 🏗 Project Structure

```
src/
├── config/            # App, Database, JWT, Swagger configuration
├── common/            # Cross-cutting concerns
│   ├── constants/     # App constants, error codes
│   ├── decorators/    # @CurrentUser, @Public, @Roles
│   ├── dto/           # ApiResponse, Pagination
│   ├── enums/         # UserRole, TaskStatus
│   ├── exceptions/    # BusinessException
│   ├── filters/       # Global exception filters
│   ├── guards/        # JWT auth, Roles guard
│   ├── interceptors/  # Response transform, Logging, Timeout, Cache
│   ├── middleware/     # Request ID
│   └── pipes/         # Validation pipe
├── database/          # TypeORM module, seeds
├── modules/
│   ├── auth/          # JWT + Passport authentication
│   ├── users/         # User CRUD
│   ├── tasks/         # Task CRUD with RxJS
│   ├── rxjs-examples/ # 9 RxJS learning endpoints
│   ├── realtime/      # WebSocket gateway
│   └── health/        # Health check
└── shared/            # Logger
```

## 🔐 Auth Flow

```
Register → POST /api/v1/auth/register → { accessToken, refreshToken }
Login    → POST /api/v1/auth/login    → { accessToken, refreshToken }
Access   → GET /api/v1/tasks (Header: Authorization: Bearer <token>)
Refresh  → POST /api/v1/auth/refresh  → { newAccessToken, newRefreshToken }
```

## 🔄 Chuyển sang MySQL

Đổi `.env`:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nestjs_learning
DB_SYNCHRONIZE=true
```

Rồi cài driver: `npm i mysql2`

## 📝 Tech Stack

| Package | Version | Mục đích |
|---------|---------|----------|
| NestJS | v11 | Framework |
| RxJS | v7 | Reactive programming |
| TypeORM | latest | ORM |
| better-sqlite3 | latest | Dev database |
| Passport + JWT | latest | Authentication |
| class-validator | latest | DTO validation |
| Swagger | latest | API documentation |
| Helmet | latest | Security headers |
| @nestjs/throttler | latest | Rate limiting |
| @nestjs/terminus | latest | Health checks |
| socket.io | latest | WebSocket |
