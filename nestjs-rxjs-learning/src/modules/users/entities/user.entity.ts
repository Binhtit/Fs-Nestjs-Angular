/**
 * KHÁI NIỆM: TypeORM Entity (Database Model)
 *
 * TẠI SAO dùng Entity:
 * 1. ORM mapping: Class ↔ Database Table, Property ↔ Column
 * 2. Type-safe: TypeScript types cho database schema
 * 3. Migrations: TypeORM generate migration từ entity changes
 * 4. Relations: Define relationships (1-1, 1-N, N-N) bằng decorators
 *
 * DECORATOR GIẢI THÍCH:
 * @Entity('table_name')      → Map class sang table trong DB
 * @PrimaryGeneratedColumn()  → Primary key auto-increment
 * @Column()                  → Map property sang column
 * @CreateDateColumn()        → Tự động set giá trị khi INSERT
 * @UpdateDateColumn()        → Tự động update khi UPDATE
 * @OneToMany()               → Quan hệ 1-N (1 user có nhiều tasks)
 *
 * LỖI PHỔ BIẾN:
 * - Quên @Column() → property không map sang DB → data mất
 * - Dùng @Column({ unique: true }) nhưng không handle duplicate error
 * - Không set default values → INSERT thiếu field → DB error
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserRole } from '../../../common/enums/role.enum';
import type { TaskEntity } from '../../tasks/entities/task.entity';

/**
 * @Entity('users'): Map class UserEntity → table "users" trong DB
 *
 * Convention: Entity class name = singular (UserEntity)
 *             Table name = plural (users)
 *
 * Nếu không truyền tên: @Entity() → table name = class name lowercase
 */
@Entity('users')
export class UserEntity {
  /**
   * @PrimaryGeneratedColumn('increment')
   *
   * Primary Key auto-increment:
   * - SQLite: INTEGER PRIMARY KEY AUTOINCREMENT
   * - MySQL: INT AUTO_INCREMENT PRIMARY KEY
   *
   * Alternatives:
   * - 'uuid': Generate UUID v4 → tốt cho distributed systems
   * - 'rowid': SQLite specific
   *
   * TẠI SAO dùng auto-increment cho learning project:
   * - Đơn giản, dễ debug (id = 1, 2, 3, ...)
   * - URL ngắn: /users/1 thay vì /users/550e8400-e29b-41d4-a716-446655440000
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ unique: true })
   *
   * unique: true → Database tạo UNIQUE constraint
   * → Không cho phép 2 users có cùng email
   * → Nếu INSERT duplicate → TypeORM throw QueryFailedError
   *
   * TẠI SAO enforce ở DB level thay vì chỉ validate ở app level:
   * - Race condition: 2 requests cùng lúc tạo user với cùng email
   *   → App check "chưa có" cho cả 2 → cả 2 INSERT → duplicate!
   *   → DB UNIQUE constraint ngăn chặn case này
   */
  @Column({ unique: true })
  email: string;

  /**
   * @Column({ select: false })
   *
   * select: false → Mặc định KHÔNG include password khi query
   * → userRepository.find() KHÔNG trả về password field
   * → Phải explicitly select: queryBuilder.addSelect('user.password')
   *
   * TẠI SAO: Security best practice
   * - Tránh vô tình return password hash trong API response
   * - Chỉ load password khi CẦN (login validation)
   */
  @Column({ select: false })
  password: string;

  /**
   * @Column()
   * Column đơn giản, TypeORM tự detect type từ TypeScript
   * string → VARCHAR(255) (MySQL) hoặc TEXT (SQLite)
   */
  @Column()
  name: string;

  /**
   * @Column({ default: 'user' })
   *
   * default: Giá trị mặc định khi INSERT không truyền field này
   * → User mới đăng ký luôn có role = 'user'
   * → Chỉ admin mới có thể đổi role thành 'admin'
   */
  @Column({ type: 'text', default: 'user' })
  role: UserRole;

  /**
   * @Column({ nullable: true })
   *
   * nullable: true → Column chấp nhận NULL
   * Refresh token có thể NULL khi:
   * - User mới tạo (chưa login)
   * - User đã logout (token bị xóa)
   *
   * TẠI SAO lưu refresh token trong DB:
   * - Có thể REVOKE (force logout) bằng cách set NULL
   * - Verify refresh token = check DB (không chỉ verify JWT signature)
   * - Multiple devices: mỗi device 1 refresh token
   */
  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null;

  /**
   * @CreateDateColumn()
   *
   * TypeORM tự động set giá trị = NOW() khi INSERT
   * Không cần set thủ công trong code
   *
   * TẠI SAO dùng @CreateDateColumn thay vì @Column + default:
   * - TypeORM handle timezone correctly
   * - Consistent across DB types (MySQL, SQLite, PostgreSQL)
   * - Semantic: Rõ ràng đây là "ngày tạo"
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * @UpdateDateColumn()
   *
   * TypeORM tự động update giá trị = NOW() khi UPDATE
   * Mỗi lần save() → updatedAt tự động cập nhật
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * @OneToMany(() => TaskEntity, (task) => task.user)
   *
   * Quan hệ 1-N: 1 User có nhiều Tasks
   *
   * Parameters:
   * - () => TaskEntity: Lazy reference tránh circular dependency
   *   (UserEntity import TaskEntity, TaskEntity import UserEntity)
   * - (task) => task.user: Inverse side - field nào trong TaskEntity reference User
   *
   * ⚠️ @OneToMany KHÔNG tạo column trong DB
   * Column foreign key nằm ở phía @ManyToOne (TaskEntity.userId)
   *
   * eager vs lazy loading:
   * - Default: lazy (không load tasks khi query user)
   * - { eager: true }: Tự động JOIN load tasks
   * - Recommend: Giữ lazy, dùng queryBuilder.leftJoinAndSelect() khi cần
   *
   * LỖI PHỔ BIẾN: eager: true cho tất cả relations
   * → Circular loading: User load Tasks, mỗi Task load User, ...
   * → Performance: Query đơn giản trở thành multi-JOIN query
   */
  @OneToMany('TaskEntity', 'user')
  tasks: TaskEntity[];
}
