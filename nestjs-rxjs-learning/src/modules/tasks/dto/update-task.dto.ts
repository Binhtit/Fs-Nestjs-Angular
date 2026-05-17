import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { TASK_STATUS_VALUES } from '../../../common/enums/task-status.enum';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ enum: TASK_STATUS_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(TASK_STATUS_VALUES, { message: 'Status không hợp lệ' })
  status?: string;
}
