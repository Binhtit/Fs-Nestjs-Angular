# 📘 PROJECT CONTEXT — NestJS + Angular Learning Project

> **MỤC ĐÍCH CỦA FILE NÀY:**  
> Đây là file tham chiếu duy nhất (Single Source of Truth) cho toàn bộ dự án.  
> AI Agent **PHẢI đọc file này** trước khi thực hiện bất kỳ task nào.  
> **Mỗi khi chỉnh sửa code → CẬP NHẬT LẠI FILE NÀY** để phản ánh đúng hiện trạng.

> **Cập nhật lần cuối:** 2026-05-17

---

## 1. TỔNG QUAN DỰ ÁN

| Hạng mục | Giá trị |
|----------|---------|
| **Mục tiêu** | Dự án học tập NestJS + RxJS + Angular, demo best practices enterprise |
| **Workspace** | `/Users/macb/Documents/my_work_space/Nestjs/` |
| **Backend** | `nestjs-rxjs-learning/` — NestJS 11 + TypeORM + SQLite + CQRS/DDD |
| **Frontend** | `angular-task-client/` — Angular 21 + Signals + RxJS |
| **BE Port** | `http://localhost:3000` |
| **FE Port** | `http://localhost:4200` |
| **API Prefix** | `/api/v1` |
| **Swagger** | `http://localhost:3000/api-docs` |
| **WebSocket** | `ws://localhost:3000/realtime` |
| **Database** | SQLite (dev) — sẵn sàng switch MySQL (prod) |
| **Ngôn ngữ code** | TypeScript strict mode (cả BE + FE) |
| **Comment** | Tiếng Việt — giải thích WHY, không chỉ WHAT |

---

## 2. BACKEND — NestJS (`nestjs-rxjs-learning/`)

### 2.1 Tech Stack

| Thư viện | Version | Vai trò |
|----------|---------|---------|
| `@nestjs/core` | ^11.0.1 | Framework chính |
| `@nestjs/cqrs` | ^11.0.3 | CQRS pattern (CommandBus, QueryBus) |
| `@nestjs/typeorm` | ^11.0.1 | ORM |
| `better-sqlite3` | ^12.10.0 | Database driver (dev) |
| `@nestjs/passport` | ^11.0.5 | Authentication |
| `@nestjs/jwt` | ^11.0.2 | JWT token |
| `@nestjs/swagger` | ^11.4.3 | API docs |
| `@nestjs/websockets` | ^11.1.21 | WebSocket (Socket.IO) |
| `@nestjs/microservices` | ^11.1.21 | Microservices patterns |
| `@nestjs/throttler` | ^6.5.0 | Rate limiting |
| `@nestjs/terminus` | ^11.1.1 | Health checks |
| `@nestjs/cache-manager` | ^3.1.2 | Caching |
| `class-validator` | ^0.15.1 | DTO validation |
| `class-transformer` | ^0.5.1 | DTO transformation |
| `rxjs` | ^7.8.1 | Reactive programming |
| `helmet` | ^8.1.0 | Security headers |
| `compression` | ^1.8.1 | Gzip |
| `jest` | ^30.0.0 | Testing |

### 2.2 Kiến trúc

```
src/
├── main.ts                           # Bootstrap: Helmet, CORS (*), Compression, Swagger
├── app.module.ts                     # Root module — import tất cả
│
├── config/
│   ├── app.config.ts                 # PORT, ENV, API_PREFIX (registerAs)
│   ├── database.config.ts            # TypeORM config (SQLite dev)
│   ├── jwt.config.ts                 # JWT_SECRET, expiresIn
│   └── swagger.config.ts             # Swagger DocumentBuilder
│
├── common/                           # Cross-cutting concerns
│   ├── constants/
│   │   ├── app.constant.ts
│   │   └── error-code.constant.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts # @CurrentUser() — extract user từ JWT
│   │   ├── public.decorator.ts       # @Public() — skip JWT guard
│   │   └── roles.decorator.ts        # @Roles('admin') — RBAC
│   ├── dto/
│   │   ├── api-response.dto.ts       # { success, statusCode, data, message, timestamp }
│   │   └── pagination.dto.ts         # { page, limit, sortBy, sortOrder }
│   ├── enums/
│   │   ├── role.enum.ts              # Role.ADMIN, Role.USER
│   │   └── task-status.enum.ts       # TaskStatus.TODO, IN_PROGRESS, DONE, CANCELLED
│   ├── exceptions/
│   │   └── business.exception.ts     # Custom exception class
│   ├── filters/
│   │   ├── all-exceptions.filter.ts  # Global catch-all
│   │   └── business-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # JWT verify (global, skip with @Public)
│   │   └── roles.guard.ts            # RBAC guard
│   ├── interceptors/
│   │   ├── cache.interceptor.ts
│   │   ├── logging.interceptor.ts    # Request/response logging
│   │   ├── response-transform.interceptor.ts  # Wrap response → ApiResponse
│   │   └── timeout.interceptor.ts    # Request timeout (RxJS)
│   ├── middleware/
│   │   └── request-id.middleware.ts   # Attach UUID to each request
│   └── pipes/
│       └── validation.pipe.ts        # class-validator integration
│
├── database/
│   ├── database.module.ts            # TypeORM module setup
│   └── seeds/
│       └── seed.service.ts           # Tạo admin user + sample tasks khi khởi động
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts        # POST login/register/refresh/logout
│   │   ├── auth.service.ts           # JWT sign/verify, bcrypt hash
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── token-response.dto.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts       # Passport JWT strategy
│   │       └── local.strategy.ts     # Passport Local strategy
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts       # CRUD /api/v1/users (admin only)
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts        # TypeORM entity
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── tasks/                        # ⭐ DUAL ARCHITECTURE
│   │   ├── tasks.module.ts           # Register cả Simple + DDD
│   │   │
│   │   │── [Simple CRUD]
│   │   ├── tasks.controller.ts       # @Controller('tasks') — Simple CRUD
│   │   ├── tasks.service.ts          # TypeORM repository trực tiếp
│   │   ├── entities/
│   │   │   └── task.entity.ts        # Simple TypeORM entity
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   ├── update-task.dto.ts
│   │   │   └── query-task.dto.ts
│   │   │
│   │   │── [DDD + CQRS]
│   │   ├── domain/                   # Domain Layer (Pure business logic)
│   │   │   ├── entities/
│   │   │   │   └── task.entity.ts    # Aggregate Root (Rich domain model)
│   │   │   ├── value-objects/
│   │   │   │   ├── task-status.vo.ts # State machine: transitions validation
│   │   │   │   └── task-title.vo.ts  # Title validation (1-200 chars)
│   │   │   ├── events/
│   │   │   │   └── task.events.ts    # Domain events
│   │   │   └── repositories/
│   │   │       └── task.repository.ts # ITaskRepository interface (Port)
│   │   ├── application/              # Application Layer (Use cases)
│   │   │   ├── commands/
│   │   │   │   ├── task.commands.ts  # CreateTaskCommand, UpdateTaskCommand, etc.
│   │   │   │   └── task.handlers.ts  # CommandHandlers (Write side)
│   │   │   ├── queries/
│   │   │   │   └── task.queries.ts   # GetTasksQuery, GetTaskByIdQuery + Handlers
│   │   │   ├── events/
│   │   │   │   └── task-event.handlers.ts  # Side effects (notifications, cache)
│   │   │   └── mappers/
│   │   │       └── task.mapper.ts    # Domain ↔ ORM mapping
│   │   └── infrastructure/          # Infrastructure Layer (Adapters)
│   │       ├── controllers/
│   │       │   └── tasks-ddd.controller.ts  # Thin controller → CommandBus/QueryBus
│   │       └── persistence/
│   │           ├── task.orm-entity.ts       # TypeORM entity (DB schema)
│   │           └── task.typeorm-repository.ts # Repository adapter
│   │
│   ├── rxjs-examples/                # 📚 Learning module
│   │   ├── rxjs-examples.module.ts
│   │   ├── rxjs-examples.controller.ts  # 9 GET endpoints (concepts)
│   │   └── rxjs-examples.service.ts     # Concept + code + bestPractices
│   │
│   ├── messaging/                    # 📚 Kafka/MQTT learning
│   │   ├── messaging.module.ts
│   │   ├── messaging-examples.controller.ts
│   │   ├── messaging-examples.service.ts
│   │   └── event-producer.service.ts # RxJS Subject mock transport
│   │
│   ├── realtime/                     # WebSocket
│   │   ├── realtime.module.ts
│   │   ├── realtime.gateway.ts       # Socket.IO gateway
│   │   └── realtime.service.ts
│   │
│   └── health/
│       └── health.module.ts          # GET /health (Terminus)
│
└── shared/
    ├── cache/
    │   └── cache.module.ts           # In-memory cache (sẵn sàng Redis)
    └── logger/
        └── logger.service.ts         # Custom logger
```

### 2.3 API Endpoints

#### Auth (`/api/v1/auth`) — Public

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| `POST` | `/login` | Đăng nhập → `{ accessToken, refreshToken }` | ❌ |
| `POST` | `/register` | Đăng ký → `{ accessToken, refreshToken }` | ❌ |
| `POST` | `/refresh` | Refresh token | ❌ |
| `POST` | `/logout` | Logout | ✅ JWT |

#### Users (`/api/v1/users`) — Admin only

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| `POST` | `/` | Tạo user | ✅ Admin |
| `GET` | `/` | List users | ✅ Admin |
| `GET` | `/:id` | User detail | ✅ Admin |
| `PATCH` | `/:id` | Update user | ✅ Admin |
| `DELETE` | `/:id` | Delete user | ✅ Admin |

#### Tasks (`/api/v1/tasks`) — Protected

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| `POST` | `/` | Tạo task | ✅ JWT |
| `GET` | `/` | List tasks (pagination, filter, search) | ✅ JWT |
| `GET` | `/:id` | Task detail | ✅ JWT |
| `PATCH` | `/:id` | Update task (title, description, status) | ✅ JWT |
| `DELETE` | `/:id` | Soft delete | ✅ JWT |

> **LƯU Ý:** Có 2 controllers cùng path `/tasks`:
> - `tasks.controller.ts` — Simple CRUD (dùng service trực tiếp)
> - `tasks-ddd.controller.ts` — DDD/CQRS (dùng CommandBus/QueryBus)
> Module đang register cả 2 — FE kết nối với Simple CRUD controller.

#### RxJS Examples (`/api/v1/rxjs`) — Public (decorator @Public)

| Method | Path | Concept |
|--------|------|---------|
| `GET` | `/observable-vs-promise` | Observable vs Promise |
| `GET` | `/pipe-operators` | RxJS Pipe Operators |
| `GET` | `/higher-order-mapping` | switchMap, mergeMap, concatMap |
| `GET` | `/subjects` | Subject, BehaviorSubject, ReplaySubject |
| `GET` | `/combining-streams` | combineLatest, merge, forkJoin |
| `GET` | `/error-handling` | catchError, retry, retryWhen |
| `GET` | `/rate-limiting` | debounceTime, throttleTime |
| `GET` | `/unsubscribe-patterns` | takeUntil, takeUntilDestroyed |
| `GET` | `/real-world-websocket` | WebSocket + RxJS |

#### Messaging (`/api/v1/messaging`) — Public

| Method | Path | Concept |
|--------|------|---------|
| `GET` | `/kafka-vs-mqtt` | So sánh Kafka vs MQTT |
| `GET` | `/patterns` | @MessagePattern vs @EventPattern |
| `POST` | `/pub-sub-demo` | Live demo Pub/Sub (RxJS Subject) |
| `GET` | `/dlq-idempotency` | Dead Letter Queue & Idempotency |

#### Health (`/health`) — Public (không có prefix)

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/health` | Terminus health check |

### 2.4 DDD Domain Rules (Tasks)

```
STATUS TRANSITIONS (State Machine):
  TODO → IN_PROGRESS ✅
  TODO → CANCELLED ✅
  IN_PROGRESS → TODO ✅ (revert)
  IN_PROGRESS → DONE ✅
  IN_PROGRESS → CANCELLED ✅
  DONE → (nothing) ❌ final state
  CANCELLED → (nothing) ❌ final state

TITLE: 1–200 characters (TaskTitle Value Object validates)
```

### 2.5 Global Providers

```
Guards:      JwtAuthGuard (global, skip with @Public())
             RolesGuard
Interceptors: ResponseTransformInterceptor (wrap → ApiResponse)
              LoggingInterceptor
              TimeoutInterceptor (RxJS timeout)
              CacheInterceptor
Filters:     AllExceptionsFilter
             BusinessExceptionFilter
Middleware:  RequestIdMiddleware (UUID per request)
Pipes:       ValidationPipe (class-validator)
```

### 2.6 Seed Data

| Entity | Data |
|--------|------|
| Admin user | `admin@example.com` / `admin123` / role: `admin` |
| Sample tasks | Chỉ seed admin user, tasks do user tự tạo |

### 2.7 Chạy Backend

```bash
cd nestjs-rxjs-learning
npm install
npm run start:dev        # Hot reload: http://localhost:3000
npm run build            # Production build
npm run test             # Unit tests (12 tests)
npm run test:e2e         # E2E tests (14 tests)
```

---

## 3. FRONTEND — Angular (`angular-task-client/`)

### 3.1 Tech Stack

| Thư viện | Version | Vai trò |
|----------|---------|---------|
| `@angular/core` | ^21.2.0 | Framework chính |
| `@angular/router` | ^21.2.0 | SPA routing + lazy loading |
| `@angular/forms` | ^21.2.0 | Reactive Forms |
| `rxjs` | ~7.8.0 | Async streams |

### 3.2 Kiến trúc

```
src/
├── main.ts                          # bootstrapApplication(AppComponent, appConfig)
├── environments/
│   └── environment.ts               # apiUrl: 'http://localhost:3000/api/v1'
│
└── app/
    ├── app.ts                       # Root: Navbar + <router-outlet> + Loading bar
    ├── app.config.ts                # provideRouter + provideHttpClient + withInterceptors
    ├── app.routes.ts                # Lazy loading routes + authGuard
    │
    ├── core/                        # Singleton (import 1 lần)
    │   ├── services/
    │   │   ├── base-api.service.ts  # Abstract CRUD<T> — kế thừa để scale
    │   │   └── loading.service.ts   # Signal-based active request counter
    │   ├── interceptors/
    │   │   ├── auth.interceptor.ts  # JWT token injection (clone request)
    │   │   ├── error.interceptor.ts # 401→login, 403, network error
    │   │   └── loading.interceptor.ts # finalize() auto show/hide
    │   ├── guards/
    │   │   └── auth.guard.ts        # CanActivateFn (check localStorage token)
    │   └── models/
    │       ├── api-response.model.ts # ApiResponse<T>, PaginationMeta
    │       ├── task.model.ts         # Task, TaskStatus, VALID_STATUS_TRANSITIONS
    │       └── auth.model.ts         # LoginRequest, RegisterRequest, AuthTokens
    │
    └── features/                    # Lazy loaded chunks
        ├── auth/
        │   ├── auth.routes.ts       # /auth/login, /auth/register
        │   ├── services/
        │   │   └── auth.service.ts  # Signal state + JWT decode + localStorage
        │   └── pages/
        │       ├── login.component.ts    # Reactive Form + inject()
        │       └── register.component.ts
        │
        ├── tasks/
        │   ├── tasks.routes.ts      # /tasks
        │   ├── services/
        │   │   └── task.service.ts  # extends BaseApiService<Task> (14 dòng!)
        │   ├── store/
        │   │   └── task.store.ts    # Signal store: tasks, loading, filters, computed
        │   └── pages/
        │       └── task-list.component.ts # debounceTime search + status filters
        │
        ├── rxjs-learning/
        │   ├── rxjs.routes.ts       # /rxjs
        │   ├── services/
        │   │   └── rxjs.service.ts  # shareReplay(1) cached lessons
        │   └── pages/
        │       └── rxjs-list.component.ts # Collapsible lesson cards
        │
        ├── messaging/
        │   ├── messaging.routes.ts  # /messaging
        │   └── pages/
        │       └── messaging-list.component.ts # Pub/Sub demo button
        │
        └── dashboard/
            ├── dashboard.routes.ts  # / (root)
            └── pages/
                └── dashboard.component.ts # timer polling + task stats
```

### 3.3 Path Aliases (tsconfig.json)

```json
{
  "@env": ["src/environments/environment"],
  "@core/*": ["src/app/core/*"],
  "@features/*": ["src/app/features/*"],
  "@shared/*": ["src/app/shared/*"]
}
```

### 3.4 Routes

| Path | Feature | Guard | Lazy |
|------|---------|-------|------|
| `/` | Dashboard | ✅ authGuard | ✅ |
| `/auth/login` | Login | ❌ | ✅ |
| `/auth/register` | Register | ❌ | ✅ |
| `/tasks` | Task List | ✅ authGuard | ✅ |
| `/rxjs` | RxJS Learning | ✅ authGuard | ✅ |
| `/messaging` | Messaging Learning | ✅ authGuard | ✅ |
| `/**` | → Redirect `/` | — | — |

### 3.5 Interceptor Chain (thứ tự quan trọng)

```
Request:  authInterceptor → loadingInterceptor → errorInterceptor → Server
Response: Server → errorInterceptor → loadingInterceptor → authInterceptor
```

### 3.6 State Management Pattern

```
"Signals for State, RxJS for Streams"

┌─────────────────────────────────────────────────┐
│ TaskStore (Signal-based)                        │
│                                                 │
│ STATE:     signal<Task[]>([])                   │
│            signal(false) — loading              │
│            signal('') — searchTerm              │
│                                                 │
│ DERIVED:   computed(() => filter/count)          │
│            todoCount, progressCount, doneCount  │
│                                                 │
│ ACTIONS:   loadTasks() → RxJS subscribe → set() │
│            createTask(), updateTask(), etc.      │
└─────────────────────────────────────────────────┘
```

### 3.7 RxJS Patterns đã dùng

| Operator | Nơi dùng | Mục đích |
|----------|----------|----------|
| `debounceTime(300)` | task-list search | Đợi user ngừng gõ |
| `distinctUntilChanged` | task-list search | Skip nếu query giống |
| `takeUntilDestroyed` | components | Auto-unsubscribe |
| `shareReplay(1)` | rxjs.service | Cache API response |
| `timer(0, 30000)` | dashboard | Polling health check |
| `switchMap` | dashboard polling | Cancel old, start new |
| `catchError` | error interceptor, dashboard | Handle errors |
| `finalize` | loading interceptor | Luôn tắt loading |
| `tap` | auth.service | Side-effect (save token) |
| `map` | base-api.service | Extract res.data |
| `retry(1)` | base-api.service | Auto retry |

### 3.8 Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
```

### 3.9 Chạy Frontend

```bash
cd angular-task-client
npm install
npm start                  # Dev: http://localhost:4200 (= ng serve)
npx ng serve               # Hoặc dùng trực tiếp
npx ng build               # Production build
```

> ⚠️ **LƯU Ý:** Angular CLI KHÔNG cài global → dùng `npm start` hoặc `npx ng serve`.
> Chạy `ng serve` trực tiếp → `command not found`.

---

## 4. KẾT NỐI FE ↔ BE

```
Angular (4200) ──HTTP──→ NestJS (3000)
                         │
                         ├─ CORS: origin '*' (dev)
                         ├─ Auth: JWT Bearer token
                         └─ Response: { success, statusCode, data, message }
```

### Flow đăng nhập:
```
1. User → FE Login Form (email + password)
2. FE → POST /api/v1/auth/login
3. BE → Verify bcrypt → Sign JWT → Return { accessToken, refreshToken }
4. FE → localStorage.setItem('access_token', token)
5. FE → Decode JWT → Extract user info → signal.set(user)
6. FE → authInterceptor → auto-attach Authorization: Bearer xxx
7. FE → Redirect /tasks
```

### Flow CRUD Task:
```
1. TaskListComponent.ngOnInit() → TaskStore.loadTasks()
2. TaskStore → TaskService.getAll() → GET /api/v1/tasks
3. BE: JwtAuthGuard verify → TaskController.findAll() → DB query
4. BE: ResponseTransformInterceptor wrap → {
     success: true,
     data: [task1, task2, ...],         ← data là T[] trực tiếp
     pagination: { page, limit, total, totalPages },  ← sibling field
   }
5. FE BaseApiService.getAll():
     map(res => ({ items: res.data, pagination: res.pagination }))
6. FE TaskStore:
     result.items → tasks signal
     result.pagination.total → totalCount signal
7. Template: @for (task of store.tasks(); track task.id) → render cards
```

### API Response Format (quan trọng):
```json
// Single item (GET /tasks/:id, POST /tasks, PATCH /tasks/:id)
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": { "id": 1, "title": "...", "status": "TODO" },
  "timestamp": "2026-05-17T00:00:00.000Z",
  "path": "/api/v1/tasks/1"
}

// Paginated list (GET /tasks?page=1&limit=10)
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [{ "id": 1, ... }, { "id": 2, ... }],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 },
  "timestamp": "...",
  "path": "/api/v1/tasks"
}

// Error
{
  "success": false,
  "statusCode": 404,
  "message": "Task không tồn tại",
  "data": null,
  "timestamp": "...",
  "path": "/api/v1/tasks/999"
}
```

---

## 5. SCALABLE PATTERNS (CÁCH MỞ RỘNG)

### Thêm entity mới (ví dụ: Projects)

**Backend:**
```
1. Tạo src/modules/projects/
2. Entity, DTOs, Service, Controller
3. Register vào AppModule
```

**Frontend:**
```
1. Tạo src/app/features/projects/
2. project.service.ts: extends BaseApiService<Project> { endpoint = '/projects' }
3. project.store.ts: Signal-based store
4. project-list.component.ts: UI
5. projects.routes.ts: lazy route
6. Thêm 1 dòng vào app.routes.ts:
   { path: 'projects', canActivate: [authGuard], loadChildren: () => import(...) }
```

### Thêm interceptor mới
```
1. Tạo file trong core/interceptors/
2. Thêm vào array trong app.config.ts withInterceptors([...])
```

---

## 6. KNOWN ISSUES & LƯU Ý

1. ~~**Dual Task Controllers**: BE có 2 controllers cùng path `/tasks`~~ **ĐÃ FIX**
   - DDD controller đổi path thành `/api/v1/tasks-ddd`
   - Simple CRUD controller giữ `/api/v1/tasks` (FE dùng)
   - Swagger hiện 2 nhóm riêng: `Tasks` và `Tasks-DDD (CQRS)`

2. **CORS**: Đang dùng `origin: '*'` → production cần set specific domain.

3. **Token Refresh**: FE chưa implement auto-refresh token khi 401.
   - AuthService có method nhưng chưa wire vào interceptor.

4. **Tests**: FE chưa có tests (skip-tests khi init).
   BE: 12 unit + 14 e2e tests pass.

5. **SQLite**: Dev only. Production cần MySQL/PostgreSQL.
   Config tại: `src/config/database.config.ts`

6. **Redis Cache**: Đang dùng in-memory. Sẵn sàng switch `cache-manager-redis-yet`.
   Config tại: `src/shared/cache/cache.module.ts`

---

## 7. COMMANDS THAM KHẢO NHANH

```bash
# Backend
cd nestjs-rxjs-learning
npm run start:dev          # Dev server (hot reload)
npm run build              # Build
npm run test               # Unit tests
npm run test:e2e           # E2E tests

# Frontend
cd angular-task-client
npx ng serve               # Dev server
npx ng build               # Production build
npx ng generate component features/xxx/pages/yyy  # Scaffold component

# Test API nhanh
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 8. MINDSET KHI LÀM TASK

> ⚠️ **BẮT BUỘC:** Sau mỗi lần chỉnh sửa code, CẬP NHẬT file `PROJECT_CONTEXT.md` này:
> - Thêm/xóa file → update Section 2.2 hoặc 3.2 (kiến trúc)
> - Thêm/xóa API → update Section 2.3 (endpoints)
> - Thêm/xóa route → update Section 3.4 (routes)
> - Thêm dependency → update Section 2.1 hoặc 3.1
> - Fix bug/known issue → update Section 6
> - Thay đổi pattern → update Section 5

> 📝 **Comment tiếng Việt**: Mọi file mới PHẢI có comment tiếng Việt giải thích WHY.
