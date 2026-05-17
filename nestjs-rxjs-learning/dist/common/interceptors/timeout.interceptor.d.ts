import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class TimeoutInterceptor implements NestInterceptor {
    private readonly timeoutMs;
    constructor(timeoutMs?: number);
    intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
