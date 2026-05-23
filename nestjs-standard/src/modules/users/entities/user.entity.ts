/**
 * KHÁI NIỆM: User Entity — Serialization với @Exclude()
 *
 * VẤN ĐỀ hiện tại (trước khi có entity này):
 * - Password bị loại trừ bằng cách không liệt kê trong Prisma select
 * - Phải nhớ exclude password ở MỌI query → dễ quên → lộ password
 * - Không phải NestJS-native pattern
 *
 * GIẢI PHÁP: ClassSerializerInterceptor + @Exclude()
 * - @Exclude() đánh dấu field "không bao giờ serialize ra response"
 * - ClassSerializerInterceptor tự động xử lý TOÀN BỘ responses
 * - 1 chỗ khai báo → áp dụng khắp nơi
 *
 * ENTITY vs DTO:
 * ┌──────────┬──────────────────────────────────────────────────────┐
 * │          │ Mục đích                                             │
 * ├──────────┼──────────────────────────────────────────────────────┤
 * │ Entity   │ Đại diện cho DB record (có thể có @Exclude fields)   │
 * │ DTO      │ Định nghĩa shape dữ liệu vào/ra qua API             │
 * └──────────┴──────────────────────────────────────────────────────┘
 *
 * QUY TRÌNH HOẠT ĐỘNG:
 * 1. Prisma query → plain object { id, email, password, ... }
 * 2. plainToInstance(UserEntity, plainObject) → class instance
 *    (BẮT BUỘC bước này — @Exclude chỉ hoạt động trên class instance)
 * 3. ClassSerializerInterceptor nhận response
 * 4. instanceToPlain(userEntity) → serialize → bỏ @Exclude fields
 * 5. { id, email, name, role, ... } (KHÔNG có password)
 *
 * TẠI SAO phải dùng plainToInstance():
 * - Prisma trả PLAIN OBJECT, không phải class instance
 * - @Exclude() chỉ có tác dụng khi object là class instance
 * - plainToInstance() convert plain object → class instance với metadata
 *
 * CÁCH DÙNG trong Service:
 * ```typescript
 * import { plainToInstance } from 'class-transformer';
 * import { UserEntity } from './entities/user.entity';
 *
 * const user = await this.prisma.user.findUnique({ where: { id } });
 * return plainToInstance(UserEntity, user);
 * ```
 */
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  /** @Expose(): Field NÀY được include trong serialized output */
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string | null;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  /**
   * @Exclude(): Field NÀY bị bỏ khỏi serialized output
   *
   * Dù Prisma có trả password trong query result
   * → ClassSerializerInterceptor tự động bỏ trước khi gửi response
   *
   * LƯU Ý: @Exclude() mặc định áp dụng khi SERIALIZE (to JSON)
   * Dùng @Exclude({ toPlainOnly: true }) để rõ ràng hơn:
   * → Chỉ exclude khi convert TO plain object (response)
   * → Không ảnh hưởng khi deserialize (nhận từ request)
   */
  @Exclude()
  password: string;

  /**
   * deletedAt: Soft delete timestamp (thêm sau khi implement soft delete)
   * @Exclude() vì client không cần biết record đã soft delete
   */
  @Exclude()
  deletedAt?: Date | null;

  /**
   * Constructor: Cho phép khởi tạo từ partial object
   *
   * Dùng trong plainToInstance() hoặc new UserEntity({ ...data })
   * Object.assign: copy tất cả fields từ partial vào instance
   */
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
