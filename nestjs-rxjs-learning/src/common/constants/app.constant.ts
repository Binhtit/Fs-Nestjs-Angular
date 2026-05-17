/**
 * KHÁI NIỆM: Application Constants
 *
 * TẠI SAO tập trung constants vào 1 file:
 * 1. Single Source of Truth: Không hardcode string literal rải rác
 * 2. Refactor-safe: Đổi giá trị 1 chỗ → tất cả đều cập nhật
 * 3. Type-safe: IDE autocomplete, tránh typo
 * 4. Searchable: Tìm usage dễ dàng
 *
 * LỖI PHỔ BIẾN:
 * - Hardcode 'isPublic' ở guard và decorator → typo 1 bên = bug silent
 * - Magic string khắp nơi → không biết string nào dùng ở đâu
 */

/**
 * Metadata key cho @Public() decorator
 * Dùng với SetMetadata() và Reflector.get()
 *
 * TẠI SAO dùng Symbol-like string thay vì Symbol thật:
 * - NestJS Reflector chỉ hỗ trợ string key
 * - Convention: dùng prefix 'is' cho boolean metadata
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Metadata key cho @Roles() decorator
 * Lưu danh sách roles được phép truy cập endpoint
 */
export const ROLES_KEY = 'roles';

/**
 * Thời gian timeout mặc định cho request (milliseconds)
 * 30 giây: đủ cho hầu hết operation, tránh request treo vĩnh viễn
 */
export const DEFAULT_TIMEOUT = 30_000;

/**
 * Pagination defaults
 * Dùng khi client không truyền page/limit
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
