/**
 * KHÁI NIỆM: Route Guard (CanActivateFn)
 *
 * Guard = "Bảo vệ" route — kiểm tra điều kiện trước khi cho vào
 *
 * Angular 19+ dùng FUNCTIONAL guard:
 * - Đơn giản hơn class-based guard
 * - Return: true (cho vào), false (chặn), UrlTree (redirect)
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  /** Kiểm tra token có trong localStorage không */
  const token = localStorage.getItem('access_token');

  if (token) {
    return true; // Có token → cho vào
  }

  /** Không có token → redirect về login */
  return router.createUrlTree(['/auth/login']);
};
