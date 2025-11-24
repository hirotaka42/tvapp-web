// src/types/Admin.ts
import { UserRole } from './User';

/**
 * ユーザー検索リクエスト
 */
export interface UserSearchRequest {
  searchType: 'email' | 'uid';
  searchValue: string;
}

/**
 * ユーザー検索結果
 */
export interface UserSearchResult {
  uid: string;
  email: string;
  userName: string;
  nickname: string | null;
  role: UserRole;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
}

/**
 * ロール更新リクエスト
 */
export interface UpdateRoleRequest {
  targetUid: string;
  newRole: UserRole;
}

/**
 * ロール更新レスポンス
 */
export interface UpdateRoleResponse {
  message: string;
  user: {
    uid: string;
    email: string;
    role: UserRole;
  };
}
