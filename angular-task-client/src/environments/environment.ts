/**
 * CẤU HÌNH MÔI TRƯỜNG (Environment Config)
 *
 * TẠI SAO cần environment:
 * - Dev: API chạy ở localhost:3000
 * - Production: API chạy ở domain thật
 * → Tách config ra file riêng, build sẽ tự swap
 *
 * CÁCH DÙNG:
 * import { environment } from '../environments/environment';
 * const url = environment.apiUrl + '/tasks';
 */
export const environment = {
  production: false,

  /** Base URL cho NestJS backend */
  apiUrl: 'http://localhost:3000/api/v1',
};
