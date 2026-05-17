import { HttpException, HttpStatus } from '@nestjs/common';
export interface BusinessErrorResponse {
    errorCode: string;
    message: string;
}
export declare class BusinessException extends HttpException {
    readonly errorCode: string;
    constructor(errorCode: string, message: string, statusCode?: HttpStatus);
    static unauthorized(errorCode: string, message: string): BusinessException;
    static forbidden(errorCode: string, message: string): BusinessException;
    static notFound(errorCode: string, message: string): BusinessException;
    static conflict(errorCode: string, message: string): BusinessException;
}
