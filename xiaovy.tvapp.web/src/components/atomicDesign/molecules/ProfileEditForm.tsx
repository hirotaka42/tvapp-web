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

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: currentProfile.firstName,
    lastName: currentProfile.lastName,
    nickname: currentProfile.nickname || '',
    birthday: currentProfile.birthday || '',
    phoneNumber: currentProfile.phoneNumber || '',
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
      firstName: formData.firstName,
      lastName: formData.lastName,
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 名前（姓） */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          名前（姓） <span className="text-red-600">*</span>
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
            errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="山田"
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
        )}
      </div>

      {/* 名前（名） */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          名前（名） <span className="text-red-600">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
            errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="太郎"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
        )}
      </div>

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

      {/* 生年月日 */}
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          生年月日
        </label>
        <input
          id="birthday"
          type="date"
          value={formData.birthday || ''}
          onChange={(e) => handleChange('birthday', e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
            errors.birthday ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.birthday && (
          <p className="mt-1 text-sm text-red-600">{errors.birthday}</p>
        )}
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
