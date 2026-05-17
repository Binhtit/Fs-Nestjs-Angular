import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<import("./entities/user.entity").UserEntity>;
    findAll(): Promise<import("./entities/user.entity").UserEntity[]>;
    findOne(id: number): Promise<import("./entities/user.entity").UserEntity>;
    update(id: number, dto: UpdateUserDto): Promise<import("./entities/user.entity").UserEntity>;
    remove(id: number): Promise<void>;
}
