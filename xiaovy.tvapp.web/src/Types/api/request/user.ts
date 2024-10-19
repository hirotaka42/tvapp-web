export type RegisterReq = {
    FirstName: string;
    LastName: string;
    BirthDay?: string;
    Email: string;
    EmailConfirmed?: boolean;
    PhoneNumber?: string;
    PhoneNumberConfirmed?: boolean;
    Password: string;
    IsDeleted?: boolean;
};

export type LoginReq = {
    Uid?: string;
    Email: string;
    PhoneNumber?: string;
    Password: string;
};

export type UpdateReq = {
    Uid: string;
    FirstName?: string;
    LastName?: string;
    BirthDay?: string;
    Email?: string;
    PhoneNumber?: string;
    Password?: string;
};

export type DeleteReq = {
    Uid: string;
    Password: string;
    Email?: string;
    PhoneNumber?: string;
    BirthDay: string;
};