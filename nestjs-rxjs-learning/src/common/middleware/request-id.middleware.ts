/**
 * KHÁI NIỆM: Request ID Middleware (Correlation ID)
 *
 * TẠI SAO cần Request ID:
 * 1. Distributed Tracing: Trong microservices, 1 request có thể đi qua nhiều service
 *    → Request ID giúp trace toàn bộ journey
 * 2. Debugging: Khi có bug, search log bằng request ID → tìm được toàn bộ log
 * 3. Support: User report lỗi kèm request ID → dev tìm log nhanh
 * 4. Audit: Biết request nào gây ra thay đổi nào trong DB
 *
 * MIDDLEWARE vs INTERCEPTOR:
 * ┌────────────┬──────────────────────────┬──────────────────────────┐
 * │            │ Middleware               │ Interceptor              │
 * ├────────────┼──────────────────────────┼──────────────────────────┤
 * │ Chạy khi   │ TRƯỚC mọi thứ            │ Sau middleware, guard     │
 * │ Access     │ req, res, next()         │ ExecutionContext, Observable│
 * │ Dùng cho   │ Transform request        │ Transform response        │
 * │ Ví dụ      │ Request ID, CORS, Helmet │ Logging, Caching          │
 * └────────────┴──────────────────────────┴──────────────────────────┘
 *
 * TẠI SAO Request ID dùng Middleware thay vì Interceptor:
 * - Cần gắn ID VÀO request TRƯỚC KHI guard/interceptor chạy
 * - Middleware chạy đầu tiên → ID có sẵn cho toàn bộ pipeline
 *
 * LỖI PHỔ BIẾN:
 * - Generate UUID mỗi request nhưng không gắn vào response header
 *   → Client không biết request ID để report
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * use() method: Middleware function
   *
   * @param req - Express Request
   * @param res - Express Response
   * @param next - Gọi để chuyển request sang middleware/handler tiếp theo
   *
   * TẠI SAO NestJS middleware giống Express middleware:
   * - NestJS chạy trên Express (hoặc Fastify)
   * - Middleware layer không qua abstraction layer của NestJS
   * - Truy cập trực tiếp req/res objects
   */
  use(req: Request, res: Response, next: NextFunction): void {
    /**
     * BƯỚC 1: Check header 'x-request-id' từ client
     *
     * TẠI SAO check header trước:
     * - API Gateway / Load Balancer có thể gắn request ID sẵn
     * - Nếu có → dùng lại (maintain tracing chain)
     * - Nếu không → generate mới
     *
     * Convention: Header 'x-request-id' hoặc 'x-correlation-id'
     */
    const requestId = (req.headers['x-request-id'] as string) ?? uuidV4();

    /**
     * BƯỚC 2: Gắn request ID vào request object
     * Các interceptor/guard/controller có thể đọc từ req.headers
     */
    req.headers['x-request-id'] = requestId;

    /**
     * BƯỚC 3: Gắn request ID vào response header
     * Client nhận được ID trong response → dùng để report lỗi
     */
    res.setHeader('x-request-id', requestId);

    /**
     * BƯỚC 4: Gọi next() để chuyển request đi tiếp
     *
     * ⚠️ QUAN TRỌNG: PHẢI gọi next()
     * Nếu quên → request bị treo vĩnh viễn → client timeout
     * Đây là lỗi phổ biến nhất khi viết middleware
     */
    next();
  }
}
