import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("../../common/enums/role.enum").UserRole;
        createdAt: Date;
        updatedAt: Date;
        tasks: import("../tasks/entities/task.entity").TaskEntity[];
    } | null>;
    login(user: {
        id: number;
        email: string;
        role: string;
    }): Promise<TokenResponseDto>;
    register(dto: RegisterDto): Promise<TokenResponseDto>;
    refreshTokens(refreshToken: string): Promise<TokenResponseDto>;
    logout(userId: number): Promise<void>;
    private generateTokens;
    private storeRefreshToken;
}
