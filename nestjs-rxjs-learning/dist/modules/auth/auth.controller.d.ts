import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: {
        user: {
            id: number;
            email: string;
            role: string;
        };
    }, _dto: LoginDto): Promise<import("./dto/token-response.dto").TokenResponseDto>;
    register(dto: RegisterDto): Promise<import("./dto/token-response.dto").TokenResponseDto>;
    refresh(refreshToken: string): Promise<import("./dto/token-response.dto").TokenResponseDto>;
    logout(userId: number): Promise<void>;
}
