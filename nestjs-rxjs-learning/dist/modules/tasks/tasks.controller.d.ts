import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, userId: number): import("rxjs").Observable<import("./entities/task.entity").TaskEntity>;
    findAll(query: QueryTaskDto, userId: number): import("rxjs").Observable<import("../../common/dto/api-response.dto").ApiResponse<import("./entities/task.entity").TaskEntity[]>>;
    findOne(id: number, userId: number): import("rxjs").Observable<import("./entities/task.entity").TaskEntity>;
    update(id: number, dto: UpdateTaskDto, userId: number): import("rxjs").Observable<import("./entities/task.entity").TaskEntity>;
    remove(id: number, userId: number): import("rxjs").Observable<void>;
}
