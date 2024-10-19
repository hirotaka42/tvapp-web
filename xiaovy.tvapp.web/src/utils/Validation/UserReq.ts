import{ RegisterReq, LoginReq } from '@/types/api/request/user';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// 汎用的なRequestパラメーターをチェックするバリデーション関数
function validateData<T>(data: T, requiredFields: (keyof T)[]): ValidationResult {
    const errors: string[] = [];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`${String(field)} は必須です。`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// UserRegisterData のバリデーション関数
export function validateUserRegisterData(req_body: RegisterReq): ValidationResult {
    const requiredFields: (keyof RegisterReq)[] = ["FirstName", "LastName", "Email", "Password"];
    return validateData(req_body, requiredFields);
}

// UserLoginData のバリデーション関数
export function validateUserLoginData(req_body: LoginReq): ValidationResult {
    const requiredFields: (keyof LoginReq)[] = ["Email", "Password"];
    return validateData(req_body, requiredFields);
}