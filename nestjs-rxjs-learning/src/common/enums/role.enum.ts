/**
 * KHÁI NIỆM: Role-Based Access Control (RBAC)
 *
 * TẠI SAO dùng string union type thay vì TypeScript enum:
 * 1. Tree-shakable: Enum compile thành object, union type biến mất sau compile
 * 2. Simpler: Không cần import enum, string literal đủ rõ ràng
 * 3. Compatible: TypeORM @Column({ type: 'varchar' }) hoạt động tốt với string
 * 4. NestJS convention: Nhiều dự án NestJS lớn prefer union type
 *
 * LỖI PHỔ BIẾN:
 * - Dùng numeric enum (0, 1, 2) → khó debug, DB lưu số không rõ nghĩa
 * - Không có default role → user mới không có quyền gì
 */

/**
 * Các role trong hệ thống
 * ADMIN: Quản trị viên - full quyền
 * USER: Người dùng thường - chỉ CRUD task của mình
 */
export type UserRole = 'admin' | 'user';

/**
 * Object chứa giá trị role để dùng trong decorators và guards
 * Vì TypeScript type không tồn tại ở runtime, cần object thật
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Roles(USER_ROLES.ADMIN)  // Chỉ admin mới truy cập được
 * @Get('admin/users')
 * getAllUsers() { ... }
 * ```
 */
export const USER_ROLES = {
  ADMIN: 'admin' as UserRole,
  USER: 'user' as UserRole,
} as const;
