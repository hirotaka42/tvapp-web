'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRoleBadge } from '@/components/UserRoleBadge';
import { UserProfile } from '@/types/User';

const Profile = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証チェック
    if (!authLoading && !user) {
      router.push('/user/login');
      return;
    }

    // プロファイル取得
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/User/profile', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('プロファイル情報の取得に失敗しました');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  if (authLoading || roleLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* ヘッダー */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              プロファイル
            </h1>
          </div>

          {/* プロファイル情報 */}
          <div className="px-6 py-6 space-y-6">
            {/* ロール情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ロール
              </label>
              {role !== null && <UserRoleBadge role={role} />}
            </div>

            {/* ユーザー名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ユーザー名
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {profile?.userName || 'N/A'}
              </p>
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                メールアドレス
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-base text-gray-900 dark:text-white">
                  {profile?.email || 'N/A'}
                </p>
                {profile?.emailVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    確認済み
                  </span>
                )}
                {profile?.emailVerified === false && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    未確認
                  </span>
                )}
              </div>
            </div>

            {/* 電話番号 */}
            {profile?.phoneNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  電話番号
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-base text-gray-900 dark:text-white">
                    {profile.phoneNumber}
                  </p>
                  {profile.phoneNumberVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      確認済み
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 氏名 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  姓
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {profile?.lastName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  名
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {profile?.firstName || 'N/A'}
                </p>
              </div>
            </div>

            {/* 生年月日 */}
            {profile?.birthday && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生年月日
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {profile.birthday}
                </p>
              </div>
            )}

            {/* アカウントタイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                アカウントタイプ
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {profile?.isAnonymous ? 'ゲストアカウント' : '通常アカウント'}
              </p>
            </div>

            {/* 登録日時 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                登録日時
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleString('ja-JP')
                  : 'N/A'}
              </p>
            </div>

            {/* 更新日時 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                更新日時
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {profile?.updatedAt
                  ? new Date(profile.updatedAt).toLocaleString('ja-JP')
                  : 'N/A'}
              </p>
            </div>

            {/* UID（開発用） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UID
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                {profile?.uid || 'N/A'}
              </p>
            </div>
          </div>

          {/* アクション */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;