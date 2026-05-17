# System Design — NestJS + RxJS Task Management

## Architecture Overview

```mermaid
graph TB
    Client[Client / Browser] --> Gateway[API Gateway<br>main.ts]
    
    Gateway --> Helmet[Helmet<br>Security Headers]
    Gateway --> Throttler[Rate Limiter<br>100 req/min]
    Gateway --> ReqId[Request ID<br>Middleware]
    
    ReqId --> Auth[Auth Module<br>JWT + Passport]
    ReqId --> Tasks[Tasks Module<br>DDD + CQRS]
    ReqId --> RxJS[RxJS Examples<br>9 Lessons]
    ReqId --> Messaging[Messaging Module<br>Kafka/MQTT Learning]
    ReqId --> Health[Health Module<br>Terminus]
    
    Tasks --> CommandBus[Command Bus<br>Write Operations]
    Tasks --> QueryBus[Query Bus<br>Read Operations]
    
    CommandBus --> DomainLayer[Domain Layer<br>Entities + Value Objects]
    CommandBus --> EventBus[Event Bus<br>Domain Events]
    
    QueryBus --> Cache[Cache Layer<br>In-Memory / Redis]
    QueryBus --> DB[(SQLite / MySQL<br>TypeORM)]
    
    EventBus --> Notification[WebSocket<br>Real-time Push]
    EventBus --> CacheInvalidate[Cache<br>Invalidation]
    EventBus --> MessageBroker[Message Broker<br>Kafka / MQTT mock]

    Auth --> DB
    DomainLayer --> DB
```

## DDD Bounded Contexts

```mermaid
graph LR
    subgraph "Auth Context"
        Login[Login]
        Register[Register]
        JWT[JWT Tokens]
    end
    
    subgraph "Task Context (Aggregate Root)"
        TaskEntity[Task Domain Entity]
        TaskTitle[TaskTitle VO]
        TaskStatus[TaskStatus VO<br>State Machine]
        TaskRepo[ITaskRepository<br>Port]
    end
    
    subgraph "User Context"
        UserEntity[User Entity]
        UserRole[UserRole]
    end
    
    subgraph "Messaging Context"
        EventProducer[Event Producer]
        KafkaTopics[Kafka Topics]
        MQTTTopics[MQTT Topics]
    end
    
    TaskEntity --> TaskTitle
    TaskEntity --> TaskStatus
    TaskEntity --> TaskRepo
    TaskEntity -.->|userId| UserEntity
    TaskEntity -.->|events| EventProducer
```

## CQRS Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as Controller
    participant CB as CommandBus
    participant CH as CreateTaskHandler
    participant D as Domain Entity
    participant R as Repository
    participant EB as EventBus
    participant EH as Event Handlers
    
    C->>Ctrl: POST /tasks {title}
    Ctrl->>CB: execute(CreateTaskCommand)
    CB->>CH: handle(command)
    CH->>D: Task.create(title, userId)
    Note over D: Value Objects validate
    CH->>R: save(task)
    R-->>CH: saved task
    CH->>EB: publish(TaskCreatedEvent)
    EB->>EH: handle event (async)
    Note over EH: Log, Notify, Cache invalidate
    CH-->>C: TaskResponse
```

## Layer Dependencies

```
┌─────────────────────────────────────────────┐
│                INFRASTRUCTURE               │
│  Controllers, TypeORM, Kafka, Redis         │
│  (depends on Application + Domain)          │
├─────────────────────────────────────────────┤
│                APPLICATION                  │
│  Commands, Queries, Events, DTOs, Mappers   │
│  (depends on Domain only)                   │
├─────────────────────────────────────────────┤
│                   DOMAIN                    │
│  Entities, Value Objects, Events, Ports     │
│  (depends on NOTHING - pure TypeScript)     │
└─────────────────────────────────────────────┘

Arrow direction: outer → inner (Dependency Rule)
NEVER: Domain → Infrastructure
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB | SQLite (dev), MySQL (prod) | Zero-setup development |
| Auth | JWT + Refresh Token Rotation | Stateless, secure revocation |
| Architecture | DDD + CQRS within Monolith | Learn patterns without microservice complexity |
| Messaging | In-memory mock broker | Docker-free, same code structure as production |
| Caching | In-memory (Redis-ready) | No external deps, swap to Redis with 1 config change |
| Real-time | Socket.IO + RxJS Subject | Reactive event-driven notifications |
