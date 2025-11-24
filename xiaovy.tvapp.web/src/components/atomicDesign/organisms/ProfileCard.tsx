// src/components/atomicDesign/organisms/ProfileCard.tsx
import Link from 'next/link';
import { UserProfile } from '@/types/User';
import { ProfileAvatar } from '@/components/atomicDesign/atoms/ProfileAvatar';
import { formatDateTime } from '@/utils/dateFormatter';

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const getRoleLabel = (role: number | string): string => {
    // 文字列の場合は数値に変換（数値文字列の場合）
    let roleNum: number;
    if (typeof role === 'string') {
      // "0", "1", "99" などの数値文字列の場合は変換
      const parsed = parseInt(role, 10);
      if (!isNaN(parsed)) {
        roleNum = parsed;
      } else {
        // 数値に変換できない文字列の場合はデフォルト
        console.warn('Invalid role value (non-numeric string):', role);
        return '一般ユーザー';
      }
    } else {
      roleNum = role;
    }

    switch (roleNum) {
      case -1:
        return 'ゲストユーザー（機能制限）';
      case 0:
        return '一般ユーザー';
      case 1:
        return 'DL有効化';
      case 2:
        return 'TV有効化';
      case 10:
        return 'プレビュー';
      case 99:
        return '特権ユーザー';
      default:
        console.warn('Unknown role value:', roleNum);
        return `ロール${roleNum}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      {/* ヘッダー部分（プロフィール画像、ニックネーム、編集ボタン） */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
        <div className="flex flex-col items-center text-center">
          {/* プロフィール画像 */}
          <ProfileAvatar
            photoURL={profile.photoURL}
            userName={profile.userName}
            size="xl"
            className="border-4 border-white dark:border-gray-700 mb-4"
          />

          {/* ニックネーム表示 */}
          <h2 className="text-3xl font-bold text-white mb-3">
            {profile.nickname}
          </h2>

          {/* 編集ボタン */}
          <Link
            href="/user/profile/edit"
            className="inline-block px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            編集
          </Link>
        </div>
      </div>

      {/* 基本情報セクション */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本情報</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">ニックネーム</span>
            <span className="text-gray-900 dark:text-white font-medium">{profile.nickname}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">メールアドレス</span>
            <span className="text-gray-900 dark:text-white font-medium">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">電話番号</span>
            <span className="text-gray-900 dark:text-white font-medium">{profile.phoneNumber || '未設定'}</span>
          </div>
        </div>
      </div>

      {/* アカウント情報セクション */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">アカウント情報</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">アカウント作成日</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatDateTime(profile.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">最終更新日</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatDateTime(profile.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">アカウントロール</span>
            <span className="text-gray-900 dark:text-white font-medium">{getRoleLabel(profile.role)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
