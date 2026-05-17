import { Injectable, LoggerService, Logger } from '@nestjs/common';

/**
 * Custom Logger wrapping NestJS Logger
 * Có thể mở rộng: ghi log ra file, gửi đến ELK stack, etc.
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger = new Logger();

  log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, context);
  }
}
