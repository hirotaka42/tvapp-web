// src/types/User.ts
export enum UserRole {
  GENERAL = 0,        // 一般ユーザー
  DL_ENABLED = 1,     // DL有効化
  TV_ENABLED = 2,     // TV有効化
  PREVIEW = 10,       // preview
  SUPER_USER = 99     // 特権ユーザー
}

export interface UserProfile {
  uid: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  role: UserRole;
  firstName: string;
  lastName: string;
  birthday: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAnonymous: boolean;
}
