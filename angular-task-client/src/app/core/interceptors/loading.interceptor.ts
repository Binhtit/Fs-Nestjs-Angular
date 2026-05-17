/**
 * Loading Interceptor — Auto show/hide loading spinner
 *
 * RxJS PATTERN: finalize()
 * - finalize() chạy KHI NÀO stream kết thúc (success HOẶC error)
 * - Giống finally {} trong try/catch
 * - Đảm bảo loading LUÔN tắt, không bị stuck
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  /** Bật loading TRƯỚC khi gửi request */
  loadingService.show();

  return next(req).pipe(
    /**
     * finalize(): Tắt loading SAU KHI request kết thúc
     * - Chạy cả khi success và error
     * - Không bao giờ bỏ sót (unlike tap which only runs on next/error)
     */
    finalize(() => loadingService.hide()),
  );
};
