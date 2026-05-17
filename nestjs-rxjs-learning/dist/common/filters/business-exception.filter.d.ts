import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
export declare class BusinessExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: BusinessException, host: ArgumentsHost): void;
}
