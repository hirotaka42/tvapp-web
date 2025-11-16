// src/types/AuditLog.ts
export enum AuditAction {
  ROLE_UPDATE = 'ROLE_UPDATE',
  USER_CREATE = 'USER_CREATE',
  USER_DELETE = 'USER_DELETE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
}

export interface AuditLog {
  logId: string;
  action: AuditAction;
  adminUid: string;
  targetUid: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  timestamp: Date;
  ipAddress: string | null;
}
