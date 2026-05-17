/**
 * APP CONFIG — Provider Configuration
 *
 * KHÁI NIỆM: Thay thế NgModule ở Angular 19+
 * - provideRouter: Cấu hình routing
 * - provideHttpClient: Cấu hình HttpClient + interceptors
 * - withInterceptors: Đăng ký interceptor chain
 *
 * THỨ TỰ INTERCEPTOR QUAN TRỌNG:
 * Request:  Auth → Loading → Error → Server
 * Response: Server → Error → Loading → Auth
 *
 * withFetch(): Dùng Fetch API thay XMLHttpRequest (nhanh hơn)
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,    // 1. Gắn JWT token
        loadingInterceptor, // 2. Show/hide loading
        errorInterceptor,   // 3. Handle errors
      ]),
    ),
  ],
};
