export declare const ERROR_CODES: {
    readonly AUTH_INVALID_CREDENTIALS: {
        readonly code: "AUTH_001";
        readonly message: "Email hoặc mật khẩu không đúng";
    };
    readonly AUTH_TOKEN_EXPIRED: {
        readonly code: "AUTH_002";
        readonly message: "Token đã hết hạn, vui lòng đăng nhập lại";
    };
    readonly AUTH_TOKEN_INVALID: {
        readonly code: "AUTH_003";
        readonly message: "Token không hợp lệ";
    };
    readonly AUTH_REFRESH_TOKEN_INVALID: {
        readonly code: "AUTH_004";
        readonly message: "Refresh token không hợp lệ hoặc đã hết hạn";
    };
    readonly AUTH_FORBIDDEN: {
        readonly code: "AUTH_005";
        readonly message: "Bạn không có quyền truy cập tài nguyên này";
    };
    readonly USER_NOT_FOUND: {
        readonly code: "USER_001";
        readonly message: "Không tìm thấy người dùng";
    };
    readonly USER_EMAIL_EXISTS: {
        readonly code: "USER_002";
        readonly message: "Email đã được sử dụng bởi tài khoản khác";
    };
    readonly TASK_NOT_FOUND: {
        readonly code: "TASK_001";
        readonly message: "Không tìm thấy công việc";
    };
    readonly TASK_ALREADY_COMPLETED: {
        readonly code: "TASK_002";
        readonly message: "Công việc đã hoàn thành, không thể cập nhật";
    };
    readonly TASK_NOT_OWNED: {
        readonly code: "TASK_003";
        readonly message: "Bạn không phải chủ sở hữu công việc này";
    };
    readonly SYSTEM_INTERNAL_ERROR: {
        readonly code: "SYS_001";
        readonly message: "Lỗi hệ thống, vui lòng thử lại sau";
    };
    readonly SYSTEM_TIMEOUT: {
        readonly code: "SYS_002";
        readonly message: "Request xử lý quá lâu, vui lòng thử lại";
    };
};
export type ErrorCodeKey = keyof typeof ERROR_CODES;
