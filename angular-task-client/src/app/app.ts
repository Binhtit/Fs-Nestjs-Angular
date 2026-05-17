/**
 * Root Component — Layout + Navigation
 *
 * KHÁI NIỆM: router-outlet
 * - Nơi Angular render component theo URL
 * - URL /tasks → render TaskListComponent vào <router-outlet>
 * - URL /rxjs → render RxjsListComponent vào <router-outlet>
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Global Loading Bar -->
    @if (loadingService.isLoading()) {
      <div class="loading-bar"></div>
    }

    <!-- Navbar (chỉ hiện khi đã login) -->
    @if (authService.isAuthenticated()) {
      <nav class="navbar">
        <div class="nav-brand">⚡ NestJS + Angular</div>
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">🏠 Dashboard</a>
          <a routerLink="/tasks" routerLinkActive="active">📋 Tasks</a>
          <a routerLink="/rxjs" routerLinkActive="active">🧪 RxJS</a>
          <a routerLink="/messaging" routerLinkActive="active">📡 Messaging</a>
        </div>
        <div class="nav-user">
          <span class="user-name">{{ authService.currentUser()?.name }}</span>
          <button class="btn-logout" (click)="onLogout()">🚪 Logout</button>
        </div>
      </nav>
    }

    <!-- Router Outlet: Angular render page component ở đây -->
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0f0f1a; }
    .loading-bar {
      position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 9999;
      background: linear-gradient(90deg, #6c63ff, #3b82f6, #10b981);
      animation: loading 1.5s ease-in-out infinite;
    }
    @keyframes loading {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 24px; background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-brand { color: #e0e0e0; font-weight: 700; font-size: 16px; }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a {
      padding: 8px 16px; border-radius: 8px; color: #888;
      text-decoration: none; font-size: 14px; transition: all 0.2s;
    }
    .nav-links a:hover { color: #e0e0e0; background: rgba(255,255,255,0.05); }
    .nav-links a.active { color: #a5b4fc; background: rgba(108,99,255,0.15); }
    .nav-user { display: flex; align-items: center; gap: 12px; }
    .user-name { color: #aaa; font-size: 14px; }
    .btn-logout {
      padding: 6px 14px; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; background: transparent; color: #aaa;
      cursor: pointer; font-size: 13px;
    }
    .btn-logout:hover { color: #ff6b6b; border-color: rgba(255,0,0,0.3); }
    main { min-height: calc(100vh - 60px); }
  `],
})
export class AppComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  private router = inject(Router);

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
