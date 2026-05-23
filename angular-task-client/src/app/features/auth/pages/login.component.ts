/**
 * Login Page — Reactive Form + RxJS Submit
 *
 * CONCEPTS:
 * 1. Reactive Forms: FormBuilder tạo form, Validators validate
 * 2. RxJS: subscribe login Observable, handle loading/error
 * 3. Signal: isLoading signal cho UI
 * 4. takeUntilDestroyed: auto-unsubscribe khi component destroy
 */
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>🔐 Đăng nhập</h1>
        <p class="subtitle">Task Management System</p>

        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email"
                   placeholder="admin@example.com" />
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input id="password" type="password" formControlName="password"
                   placeholder="admin123" />
          </div>

          <button type="submit" [disabled]="form.invalid || isLoading()"
                  class="btn-primary">
            {{ isLoading() ? '⏳ Đang xử lý...' : '🚀 Đăng nhập' }}
          </button>
        </form>

        <p class="link">Chưa có tài khoản? <a routerLink="/auth/register">Đăng ký</a></p>
        <p class="hint">Demo: admin&#64;example.com / admin123</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    }
    .auth-card {
      background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
      padding: 40px; width: 400px; color: #fff;
    }
    h1 { margin: 0 0 8px; font-size: 24px; }
    .subtitle { color: #aaa; margin: 0 0 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 6px; font-size: 14px; color: #ccc; }
    input {
      width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff;
      font-size: 14px; box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #6c63ff; }
    .btn-primary {
      width: 100%; padding: 12px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #6c63ff, #3b82f6); color: #fff;
      font-size: 16px; cursor: pointer; margin-top: 8px; transition: opacity 0.2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-banner {
      background: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.3);
      border-radius: 8px; padding: 12px; margin-bottom: 16px; color: #ff6b6b;
    }
    .link { text-align: center; margin-top: 16px; color: #aaa; }
    .link a { color: #6c63ff; text-decoration: none; }
    .hint { text-align: center; color: #666; font-size: 12px; margin-top: 8px; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], // Match backend: LoginDto @MinLength(6)
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();

    /**
     * RxJS subscribe pattern cho one-shot API call:
     * - subscribe({ next, error }) handle cả 2 case
     * - finalize hoặc manual set loading = false
     */
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.',
        );
      },
    });
  }
}
