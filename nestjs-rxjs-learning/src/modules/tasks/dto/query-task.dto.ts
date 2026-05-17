import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS_VALUES } from '../../../common/enums/task-status.enum';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Query DTO kế thừa PaginationQueryDto
 * Thêm filter theo status và search theo title
 */
export class QueryTaskDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo status', enum: TASK_STATUS_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(TASK_STATUS_VALUES, { message: 'Status filter không hợp lệ' })
  status?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tiêu đề' })
  @IsOptional()
  @IsString()
  search?: string;
}
