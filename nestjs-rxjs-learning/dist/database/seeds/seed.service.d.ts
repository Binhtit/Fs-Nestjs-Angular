import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../../modules/users/entities/user.entity';
export declare class SeedService implements OnModuleInit {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: Repository<UserEntity>);
    onModuleInit(): Promise<void>;
    private seedAdminUser;
}
