export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    pagination?: PaginationMeta;
    timestamp: string;
    path: string;
    static success<T>(data: T, message?: string, path?: string): ApiResponse<T>;
    static error<T = null>(statusCode: number, message: string, path?: string): ApiResponse<T>;
    static paginated<T>(data: T[], pagination: PaginationMeta, message?: string, path?: string): ApiResponse<T[]>;
}
