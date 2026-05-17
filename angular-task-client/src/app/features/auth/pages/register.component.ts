import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>📝 Đăng ký</h1>
        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Họ tên</label>
            <input id="name" formControlName="name" placeholder="Nguyễn Văn A" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" />
          </div>
          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input id="password" type="password" formControlName="password" />
          </div>
          <button type="submit" [disabled]="form.invalid || isLoading()" class="btn-primary">
            {{ isLoading() ? '⏳ ...' : '🚀 Đăng ký' }}
          </button>
        </form>
        <p class="link">Đã có tài khoản? <a routerLink="/auth/login">Đăng nhập</a></p>
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
    h1 { margin: 0 0 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 6px; color: #ccc; font-size: 14px; }
    input {
      width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff;
      font-size: 14px; box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #6c63ff; }
    .btn-primary {
      width: 100%; padding: 12px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #6c63ff, #3b82f6); color: #fff;
      font-size: 16px; cursor: pointer; margin-top: 8px;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-banner {
      background: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.3);
      border-radius: 8px; padding: 12px; margin-bottom: 16px; color: #ff6b6b;
    }
    .link { text-align: center; margin-top: 16px; color: #aaa; }
    .link a { color: #6c63ff; text-decoration: none; }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { name, email, password } = this.form.getRawValue();
    this.authService
      .register({ name: name!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message ?? 'Đăng ký thất bại');
        },
      });
  }
}
