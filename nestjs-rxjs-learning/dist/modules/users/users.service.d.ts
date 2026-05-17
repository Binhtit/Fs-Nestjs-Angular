import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    create(dto: CreateUserDto): Promise<UserEntity>;
    findAll(): Promise<UserEntity[]>;
    findOne(id: number): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    update(id: number, dto: UpdateUserDto): Promise<UserEntity>;
    remove(id: number): Promise<void>;
    updateRefreshToken(userId: number, refreshToken: string | null): Promise<void>;
}
