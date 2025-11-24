'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { LoadingSkeleton } from '@/components/atomicDesign/atoms/LoadingSkeleton';
import { UserRoleBadge } from '@/components/UserRoleBadge';
import { ProfileAvatar } from '@/components/atomicDesign/atoms/ProfileAvatar';
import { ConfirmationModal } from '@/components/atomicDesign/molecules/ConfirmationModal';
import { UserRole } from '@/types/User';
import { UserSearchResult } from '@/types/Admin';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();

  const [searchType, setSearchType] = useState<'email' | 'uid'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 権限チェック
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        toast.error('ログインが必要です');
        router.push('/user/login');
        return;
      }

      if (user.isAnonymous) {
        toast.error('ゲストユーザーはアクセスできません');
        router.push('/');
        return;
      }

      if (role !== UserRole.SUPER_USER) {
        toast.error('管理者権限が必要です');
        router.push('/');
        return;
      }
    }
  }, [user, role, authLoading, roleLoading, router]);

  // ユーザー検索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      toast.error('検索値を入力してください');
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(
        `/api/admin/users/search?searchType=${searchType}&searchValue=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'ユーザー検索に失敗しました');
      }

      const result: UserSearchResult = await response.json();
      setSearchResult(result);
      setSelectedRole(result.role);
      toast.success('ユーザーが見つかりました');
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error instanceof Error ? error.message : 'ユーザー検索に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  // ロール更新確認
  const handleUpdateRoleClick = () => {
    if (!searchResult || selectedRole === null) {
      return;
    }

    if (selectedRole === searchResult.role) {
      toast.error('ロールが変更されていません');
      return;
    }

    setConfirmModalOpen(true);
  };

  // ロール更新実行
  const handleUpdateRoleConfirm = async () => {
    if (!searchResult || selectedRole === null) {
      return;
    }

    setUpdating(true);

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch('/api/admin/updateRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          targetUid: searchResult.uid,
          newRole: selectedRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'ロール更新に失敗しました');
      }

      const result = await response.json();
      toast.success(result.message || 'ロールを更新しました');

      // 検索結果を更新
      setSearchResult({ ...searchResult, role: selectedRole });
    } catch (error) {
      console.error('Update role error:', error);
      toast.error(error instanceof Error ? error.message : 'ロール更新に失敗しました');
    } finally {
      setUpdating(false);
      setConfirmModalOpen(false);
    }
  };

  // ロール選択肢
  const roleOptions = [
    { value: UserRole.GUEST, label: 'ゲストユーザー（機能制限）' },
    { value: UserRole.GENERAL, label: '一般ユーザー' },
    { value: UserRole.DL_ENABLED, label: 'DL有効化' },
    { value: UserRole.TV_ENABLED, label: 'TV有効化' },
    { value: UserRole.PREVIEW, label: 'プレビュー' },
    { value: UserRole.SUPER_USER, label: '特権ユーザー' },
  ];

  // ローディング中
  if (authLoading || roleLoading) {
    return <LoadingSkeleton />;
  }

  // 権限チェック中
  if (!user || role !== UserRole.SUPER_USER) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          ユーザー管理
        </h1>

        {/* 検索フォーム */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            ユーザー検索
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* 検索タイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                検索タイプ
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={searchType === 'email'}
                    onChange={(e) => setSearchType(e.target.value as 'email' | 'uid')}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">メールアドレス</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="uid"
                    checked={searchType === 'uid'}
                    onChange={(e) => setSearchType(e.target.value as 'email' | 'uid')}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">UID</span>
                </label>
              </div>
            </div>

            {/* 検索入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {searchType === 'email' ? 'メールアドレス' : 'UID'}
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'email'
                    ? 'user@example.com'
                    : 'zL1trFvj5waKXpq4dJ8Pf29LWPH3'
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 検索ボタン */}
            <button
              type="submit"
              disabled={searching}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {searching ? '検索中...' : '検索'}
            </button>
          </form>
        </div>

        {/* 検索結果 */}
        {searchResult && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              ユーザー情報
            </h2>

            {/* ユーザー基本情報 */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <ProfileAvatar
                photoURL={searchResult.photoURL}
                userName={searchResult.userName}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchResult.nickname || searchResult.userName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResult.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  UID: {searchResult.uid}
                </p>
              </div>
            </div>

            {/* ユーザー詳細情報 */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ユーザー名</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {searchResult.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ニックネーム</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {searchResult.nickname || '未設定'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">メール認証</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {searchResult.emailVerified ? '認証済み' : '未認証'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">現在のロール</span>
                <UserRoleBadge role={searchResult.role} />
              </div>
            </div>

            {/* ロール変更フォーム */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                ロールを変更
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    新しいロール
                  </label>
                  <select
                    value={selectedRole ?? ''}
                    onChange={(e) => setSelectedRole(Number(e.target.value) as UserRole)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleUpdateRoleClick}
                  disabled={updating || selectedRole === searchResult.role}
                  className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {updating ? '更新中...' : 'ロールを更新'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 確認モーダル */}
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleUpdateRoleConfirm}
          title="ロール変更の確認"
          message={`${searchResult?.email} のロールを変更しますか？`}
          confirmText="変更する"
          cancelText="キャンセル"
          confirmVariant="primary"
        />
      </div>
    </div>
  );
}
