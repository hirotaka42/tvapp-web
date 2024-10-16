type UserLoginData = {
    email: string;
    phoneNumber?: string;
    password: string;
    uuid?: string;
};

export function validateUserLoginData(data: UserLoginData) {
    const errors: string[] = [];
    
    if (!data.email) {
        errors.push("Email is required.");
    }
    
    if (!data.password) {
        errors.push("Password is required.");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}