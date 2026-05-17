import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class CacheInterceptor implements NestInterceptor {
    private readonly cache;
    private readonly ttlMs;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
