type UserRegisterData = {
    firstname: string;
    lastname: string;
    birthday?: string;
    email: string;
    emailConfirmed?: boolean;
    phoneNumber?: string;
    phoneNumberConfirmed?: boolean;
    password_hash: string;
    IsDeleted?: boolean;
};

export function validateUserRegisterData(data: UserRegisterData) {
    const errors: string[] = [];
    
    if (!data.firstname) {
        errors.push("Firstname is required.");
    }
    
    if (!data.lastname) {
        errors.push("Lastname is required.");
    }
    
    if (!data.email) {
        errors.push("Email is required.");
    }
    
    if (!data.password_hash) {
        errors.push("Password hash is required.");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}