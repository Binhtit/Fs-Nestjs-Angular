/**
 * KHÁI NIỆM: Repository Pattern trong Service Layer
 *
 * TẠI SAO dùng Repository Pattern:
 * - Tách biệt business logic khỏi data access logic
 * - Dễ test: Mock repository trong unit test
 * - Đổi database: chỉ đổi repository, không đụng service
 *
 * LỖI PHỔ BIẾN: Query DB trực tiếp trong controller → khó test, khó maintain
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../common/constants/error-code.constant';
import type { UserRole } from '../../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Tạo user mới
   * 1. Check email trùng
   * 2. Hash password
   * 3. Save vào DB
   */
  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw BusinessException.conflict(
        ERROR_CODES.USER_EMAIL_EXISTS.code,
        ERROR_CODES.USER_EMAIL_EXISTS.message,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: (dto.role ?? 'user') as UserRole,
    });

    const saved = await this.userRepository.save(user);
    return saved;
  }

  /** Lấy tất cả users */
  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  /** Tìm user theo ID */
  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.notFound(
        ERROR_CODES.USER_NOT_FOUND.code,
        ERROR_CODES.USER_NOT_FOUND.message,
      );
    }
    return user;
  }

  /** Tìm user theo email (bao gồm password cho auth) */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.refreshToken')
      .where('user.email = :email', { email })
      .getOne();
  }

  /** Cập nhật user */
  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  /** Xóa user */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /** Cập nhật refresh token */
  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }
}
