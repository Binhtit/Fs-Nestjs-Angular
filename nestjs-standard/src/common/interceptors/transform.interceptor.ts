/**
 * KHÁI NIỆM: Transform Interceptor — Wrap response thành format chuẩn
 *
 * VẤN ĐỀ nếu KHÔNG có interceptor này:
 * - Controller A trả: { id: 1, name: 'John' }
 * - Controller B trả: { data: [...], count: 10 }
 * - Controller C trả: 'OK'
 * → Frontend phải xử lý 3 format khác nhau → rối!
 *
 * GIẢI PHÁP: Wrap TẤT CẢ response vào format thống nhất:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Thành công",
 *   data: { ... },         ← data gốc từ controller
 *   timestamp: "2026-...",
 *   path: "/api/v1/posts"
 * }
 *
 * RxJS OPERATOR: map()
 * - map() TRANSFORM data → trả về giá trị MỚI
 * - Khác tap() (chỉ side-effect, không đổi data)
 *
 * SO SÁNH DỰ ÁN:
 * - Dự án DDD: dùng class ApiResponse + static factory methods
 * - Dự án Standard: dùng interceptor + plain object (đơn giản hơn)
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Interface response chuẩn — FE luôn nhận format này */
export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    /**
     * map(): Transform controller response → StandardResponse
     *
     * Controller trả: { id: 1, title: 'Hello' }
     * Interceptor wrap: { success: true, data: { id: 1, title: 'Hello' }, ... }
     */
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        message: 'Thành công',
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
