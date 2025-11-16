'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { ProfileImageUploader } from '@/components/atomicDesign/molecules/ProfileImageUploader';
import { ProfileEditForm } from '@/components/atomicDesign/molecules/ProfileEditForm';
import { LoadingSkeleton } from '@/components/atomicDesign/atoms/LoadingSkeleton';
import { UserProfile } from '@/types/User';
import toast from 'react-hot-toast';

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証チェック
    if (!authLoading && !user) {
      router.push('/user/login');
      return;
    }

    // ゲストユーザーチェック
    if (user?.isAnonymous) {
      toast.error('ゲストユーザーはプロフィールを編集できません');
      router.push('/');
      return;
    }

    // プロフィール取得
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const idToken = await user?.getIdToken();

      const response = await fetch('/api/User/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      toast.error('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploadSuccess = (photoURL: string) => {
    if (profile) {
      setProfile({ ...profile, photoURL });
    }
  };

  const handlePhotoDeleteSuccess = () => {
    if (profile) {
      setProfile({ ...profile, photoURL: null });
    }
  };

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              {error || 'プロフィール情報を読み込めませんでした'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          プロフィール編集
        </h1>

        <div className="space-y-8">
          {/* プロフィール画像編集セクション */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              プロフィール画像
            </h2>
            <ProfileImageUploader
              currentPhotoURL={profile.photoURL}
              userName={profile.userName}
              onUploadSuccess={handlePhotoUploadSuccess}
              onDeleteSuccess={handlePhotoDeleteSuccess}
            />
          </div>

          {/* プロフィール情報編集セクション */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              基本情報
            </h2>
            <ProfileEditForm currentProfile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
