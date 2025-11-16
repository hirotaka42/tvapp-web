import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/User';

interface RoleProtectedProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
}

export function RoleProtected({ children, requiredRole, fallback }: RoleProtectedProps) {
  const { role, loading } = useUserRole();

  if (loading) return <div>Loading...</div>;

  // ゲストユーザー（ロール-1）はすべての保護されたリソースにアクセス不可
  if (role === UserRole.GUEST) {
    return <>{fallback || <div>ゲストユーザーは本機能を利用できません</div>}</>;
  }

  if (role === null || role < requiredRole) {
    return <>{fallback || <div>権限がありません</div>}</>;
  }

  return <>{children}</>;
}
