/**
 * KHÁI NIỆM: Database Seeding
 *
 * TẠI SAO cần seed data:
 * 1. Development: Có data sẵn để test, không cần tạo thủ công
 * 2. Admin account: Hệ thống cần ít nhất 1 admin để bắt đầu
 * 3. Master data: Danh sách tỉnh/thành, loại task, etc.
 *
 * PATTERN: OnModuleInit lifecycle hook
 * - NestJS gọi onModuleInit() sau khi module khởi tạo xong
 * - Đảm bảo database connection sẵn sàng trước khi seed
 * - Chạy 1 lần khi app start
 *
 * NGUYÊN TẮC: Idempotent Seeding
 * - Seed phải an toàn khi chạy nhiều lần (app restart)
 * - Check "đã có chưa" trước khi insert → tránh duplicate
 * - Không xóa data existing → tránh mất data user tạo
 *
 * LỖI PHỔ BIẾN:
 * - Seed không idempotent → restart app = duplicate data
 * - Seed quá nhiều data → app start chậm
 * - Hardcode password trong seed → commit lên git = lộ password
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../../modules/users/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  /**
   * @InjectRepository(UserEntity): Inject TypeORM Repository cho UserEntity
   *
   * Repository<UserEntity>: Generic repository cung cấp CRUD methods
   * - find(), findOne(), save(), update(), delete(), etc.
   * - TypeORM tự động generate SQL từ entity metadata
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * OnModuleInit: Lifecycle hook chạy khi module init xong
   * Đây là nơi phù hợp để seed data vì DB connection đã sẵn sàng
   */
  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
    this.logger.log('✅ Database seeding hoàn tất');
  }

  /**
   * Tạo admin user mặc định
   *
   * Idempotent: Check email trước → chỉ tạo nếu chưa có
   */
  private async seedAdminUser(): Promise<void> {
    const adminEmail = 'admin@example.com';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('Admin user đã tồn tại, bỏ qua seeding');
      return;
    }

    /**
     * bcrypt.hash(password, saltRounds):
     * - saltRounds = 10: Số vòng hash (2^10 = 1024 iterations)
     * - Cao hơn = an toàn hơn nhưng chậm hơn
     * - 10 là mức recommended cho hầu hết ứng dụng
     *
     * TẠI SAO dùng bcrypt thay vì SHA256/MD5:
     * - bcrypt chậm BY DESIGN → brute-force attack khó hơn
     * - Tự động thêm salt → cùng password khác hash → rainbow table attack thất bại
     * - Adaptive: Tăng saltRounds khi hardware mạnh hơn
     */
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = this.userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });

    await this.userRepository.save(adminUser);
    this.logger.log(`🌱 Đã tạo admin user: ${adminEmail} / admin123`);
  }
}
