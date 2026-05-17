/** Auth DTOs — match NestJS backend auth endpoints */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/** Token response từ POST /auth/login và /auth/register */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/** User info (decode từ JWT hoặc lấy từ API) */
export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
}
