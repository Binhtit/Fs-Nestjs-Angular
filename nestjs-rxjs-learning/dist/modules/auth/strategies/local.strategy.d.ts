import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("../../../common/enums/role.enum").UserRole;
        createdAt: Date;
        updatedAt: Date;
        tasks: import("../../tasks/entities/task.entity").TaskEntity[];
    }>;
}
export {};
