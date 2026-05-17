/**
 * KHÁI NIỆM: Mapped Types - PartialType
 * TẠI SAO: DRY - không lặp fields từ CreateUserDto
 * PartialType: Tất cả fields → optional (cho UPDATE)
 * ⚠️ Import từ @nestjs/swagger (không phải @nestjs/mapped-types)
 */
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
