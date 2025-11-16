import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';

export function useUserRole() {
  const { user } = useFirebaseAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (retryCount = 0) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // ID Tokenを取得してCustom Claimsを読み取る
        const idTokenResult = await user.getIdTokenResult(true); // forceRefresh: true
        const userRole = idTokenResult.claims.role as UserRole;
        console.log('=== useUserRole Debug (Attempt ' + (retryCount + 1) + ') ===');
        console.log('User UID:', user.uid);
        console.log('Is Anonymous:', user.isAnonymous);
        console.log('Fetched user role:', userRole);
        console.log('All Claims:', idTokenResult.claims);
        console.log('Role type:', typeof userRole);
        console.log('========================');

        // ロールが明示的に設定されているか確認
        if (userRole !== undefined && userRole !== null) {
          setRole(userRole);
          setLoading(false);
        } else if (retryCount < 3) {
          // ロールが取得できない場合は、最大3回までリトライ
          console.warn(`Role is undefined, retrying... (${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          fetchRole(retryCount + 1);
        } else {
          console.warn('Role is undefined after 3 retries, setting to GENERAL');
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
