import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';
import { PHASE2_USER_DATA_ENABLED } from '@/lib/features';

export function useUserRole() {
  const { user } = useFirebaseAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ロール(カスタムクレイム)は段階2/管理機能向け。MVP では未設定なので
    // リトライやログを出さず即座に一般ユーザーとして扱う(ログ雑音・遅延の回避)。
    if (!PHASE2_USER_DATA_ENABLED) {
      setRole(user ? UserRole.GENERAL : null);
      setLoading(false);
      return;
    }

    const fetchRole = async (retryCount = 0) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }
      try {
        const idTokenResult = await user.getIdTokenResult(true);
        const userRole = idTokenResult.claims.role as UserRole;
        if (userRole !== undefined && userRole !== null) {
          setRole(userRole);
          setLoading(false);
        } else if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          fetchRole(retryCount + 1);
        } else {
          setRole(UserRole.GENERAL);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(UserRole.GENERAL);
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
