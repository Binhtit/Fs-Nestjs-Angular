import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
export declare class TasksService {
    private readonly taskRepository;
    private readonly logger;
    constructor(taskRepository: Repository<TaskEntity>);
    create(dto: CreateTaskDto, userId: number): Observable<TaskEntity>;
    findAll(query: QueryTaskDto, userId: number): Observable<ApiResponse<TaskEntity[]>>;
    findOne(id: number, userId: number): Observable<TaskEntity>;
    update(id: number, dto: UpdateTaskDto, userId: number): Observable<TaskEntity>;
    remove(id: number, userId: number): Observable<void>;
}
