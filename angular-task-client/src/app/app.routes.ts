/**
 * APP ROUTES — Lazy Loading
 *
 * KHÁI NIỆM: Lazy Loading
 * - Mỗi feature được load RIÊNG BIỆT (code-splitting)
 * - User vào /tasks → chỉ download tasks code
 * - User vào /rxjs → chỉ download rxjs code
 * → Tốc độ load trang nhanh hơn (nhỏ bundle hơn)
 *
 * loadChildren: Load cả nhóm routes của 1 feature
 * loadComponent: Load 1 component đơn lẻ
 *
 * canActivate: Guard bảo vệ route
 * → authGuard kiểm tra token trước khi cho vào
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  /** Dashboard — protected */
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },

  /** Auth — public (login, register) */
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  /** Tasks — protected */
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
  },

  /** RxJS Learning — protected */
  {
    path: 'rxjs',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/rxjs-learning/rxjs.routes').then((m) => m.RXJS_ROUTES),
  },

  /** Messaging — protected */
  {
    path: 'messaging',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/messaging/messaging.routes').then((m) => m.MESSAGING_ROUTES),
  },

  /** Fallback */
  { path: '**', redirectTo: '' },
];
