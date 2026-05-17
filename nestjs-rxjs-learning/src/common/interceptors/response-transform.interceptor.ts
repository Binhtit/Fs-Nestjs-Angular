/**
 * KHÁI NIỆM: Response Transform Interceptor với RxJS map()
 *
 * TẠI SAO cần Interceptor:
 * - Interceptor chạy TRƯỚC và SAU handler (controller method)
 * - Dùng để transform response, logging, caching, error handling
 * - Tương tự AOP (Aspect-Oriented Programming): cross-cutting concerns
 *
 * INTERCEPTOR LIFECYCLE:
 * ┌──────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────┐
 * │ Request  │ →  │ Interceptor  │ →  │ Controller │ →  │ Interceptor  │
 * │          │    │ BEFORE       │    │ handler()  │    │ AFTER (pipe) │
 * │          │    │ (code trước  │    │ return data│    │ (transform   │
 * │          │    │  next.handle)│    │            │    │  response)   │
 * └──────────┘    └──────────────┘    └────────────┘    └──────────────┘
 *
 * RxJS OPERATOR: map()
 * - TÁC DỤNG: Transform mỗi giá trị trong Observable stream
 * - GIỐNG: Array.map() nhưng cho async stream
 * - DÙNG KHI: Cần biến đổi data mà không thay đổi stream structure
 *
 * Ở ĐÂY: map() wrap controller response vào ApiResponse format
 * - Controller return { name: 'John' }
 * - Interceptor transform → { success: true, data: { name: 'John' }, ... }
 *
 * LỖI PHỔ BIẾN:
 * - Wrap response ở mỗi controller method → lặp code
 * - Quên handle null/undefined data → frontend crash
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * NestInterceptor interface:
 * - Bắt buộc implement intercept(context, next)
 * - context: ExecutionContext (request info)
 * - next: CallHandler (gọi handler tiếp theo)
 *
 * CallHandler.handle():
 * - Trả về Observable<T> chứa response từ controller
 * - Nếu không gọi next.handle() → controller KHÔNG được gọi
 * - Gọi next.handle().pipe(...) → transform response
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  /**
   * intercept() method
   *
   * @param context - ExecutionContext: chứa request, response, handler info
   * @param next - CallHandler: gọi để execute controller handler
   * @returns Observable<ApiResponse<T>> - Response đã được wrap
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    /**
     * Lấy request object để extract path
     * Path dùng cho ApiResponse.path field → debugging
     */
    const request = context.switchToHttp().getRequest();
    const path = request.url as string;

    /**
     * next.handle() → Observable<T>
     *
     * GIẢI THÍCH CHI TIẾT:
     * 1. next.handle() gọi controller method
     * 2. Controller return value → emit vào Observable
     * 3. .pipe() chain các RxJS operators
     * 4. map() transform data → ApiResponse format
     *
     * OPERATOR: map()
     * Input:  { name: 'John', email: 'john@test.com' }  ← raw data từ controller
     * Output: { success: true, statusCode: 200, data: { name: 'John', ... }, ... }
     *
     * TẠI SAO dùng map() thay vì tap():
     * - map() TRANSFORM data → trả về giá trị mới
     * - tap() SIDE-EFFECT → không thay đổi data (dùng cho logging)
     */
    return next.handle().pipe(
      map((data) => {
        /**
         * Nếu data đã là ApiResponse → không wrap lại
         * Tránh double-wrap: { success: true, data: { success: true, data: ... } }
         */
        if (data instanceof ApiResponse) {
          return data;
        }

        return ApiResponse.success<T>(data, 'Thành công', path);
      }),
    );
  }
}
