'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileServiceContext } from '@/contexts/ProfileContext';
import { UpdateProfileRequest } from '@/types/ProfileEdit';
import { UserProfile } from '@/types/User';
import { validateProfileUpdate } from '@/utils/profileValidation';
import toast from 'react-hot-toast';

interface ProfileEditFormProps {
  currentProfile: UserProfile;
}

export function ProfileEditForm({ currentProfile }: ProfileEditFormProps) {
  const router = useRouter();
  const service = useContext(ProfileServiceContext);

  const getRoleLabel = (role: number | string): string => {
    // 文字列の場合は数値に変換
    const roleNum = typeof role === 'string' ? parseInt(role, 10) : role;

    // 特殊ケース：文字列 'user' は 0（一般ユーザー）に該当
    if (role === 'user' || role === 'GENERAL') {
      return '一般ユーザー';
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
        return `ロール${role}`;
    }
  };

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    nickname: currentProfile.nickname || '',
    phoneNumber: currentProfile.phoneNumber || '',
    birthday: currentProfile.birthday || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!service) {
    throw new Error('ProfileEditForm must be used within ProfileServiceContext');
  }

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // フィールド変更時にそのフィールドのエラーをクリア
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // クライアントサイドバリデーション
    const validationResult = validateProfileUpdate({
      nickname: formData.nickname || null,
      birthday: formData.birthday || null,
      phoneNumber: formData.phoneNumber || null,
    });

    if (!validationResult.isValid) {
      const errorMap: Record<string, string> = {};
      validationResult.errors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      toast.error('入力内容に誤りがあります');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // 空文字列をnullに変換
      const updateRequest: UpdateProfileRequest = {
        nickname: formData.nickname ? formData.nickname.trim() || null : null,
        birthday: formData.birthday ? formData.birthday.trim() || null : null,
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() || null : null,
      };

      await service.updateProfile(updateRequest);
      toast.success('プロフィールを更新しました');

      // プロフィール表示ページに戻る
      router.push('/user/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました';
      toast.error(errorMessage);
      console.error('Update profile error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/user/profile');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本情報セクション */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本情報</h2>
        <div className="space-y-5">
          {/* ニックネーム */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              ニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              value={formData.nickname || ''}
              onChange={(e) => handleChange('nickname', e.target.value)}
              disabled={isSubmitting}
              maxLength={20}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                errors.nickname ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Taro"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(formData.nickname || '').length}/20
            </p>
          </div>

          {/* メールアドレス（読取専用） */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={currentProfile.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              電話番号
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="090-1234-5678"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* アカウント情報セクション */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">アカウント情報</h2>
        <div className="space-y-4">
          {/* アカウント作成日（読取専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              アカウント作成日
            </label>
            <input
              type="text"
              value={new Date(currentProfile.createdAt).toLocaleString('ja-JP')}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 最終更新日（読取専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              最終更新日
            </label>
            <input
              type="text"
              value={new Date(currentProfile.updatedAt).toLocaleString('ja-JP')}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* アカウントロール（読取専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              アカウントロール
            </label>
            <input
              type="text"
              value={getRoleLabel(currentProfile.role)}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? '更新中...' : '更新する'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
