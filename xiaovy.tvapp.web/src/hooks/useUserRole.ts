import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';

export function useUserRole() {
  const { user } = useFirebaseAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // ID Tokenを取得してCustom Claimsを読み取る
        const idTokenResult = await user.getIdTokenResult();
        const userRole = (idTokenResult.claims.role as UserRole) || UserRole.GENERAL;
        setRole(userRole);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(UserRole.GENERAL);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
