// src/components/atomicDesign/organisms/ProfileCard.tsx
import Link from 'next/link';
import { UserProfile } from '@/types/User';
import { ProfileSection } from '@/components/atomicDesign/molecules/ProfileSection';
import { ProfileField } from '@/components/atomicDesign/atoms/ProfileField';
import { BadgeDisplay } from '@/components/atomicDesign/atoms/BadgeDisplay';
import { ProfileAvatar } from '@/components/atomicDesign/atoms/ProfileAvatar';
import { formatDateTime, formatDate } from '@/utils/dateFormatter';

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      {/* ヘッダー部分（プロフィール画像と編集ボタン） */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* プロフィール画像 */}
          <ProfileAvatar
            photoURL={profile.photoURL}
            userName={profile.userName}
            size="xl"
            className="border-4 border-white dark:border-gray-700"
          />

          {/* ユーザー名表示 */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              {profile.lastName} {profile.firstName}
            </h2>
            <p className="text-blue-100 text-lg">
              @{profile.userName}
            </p>
          </div>

          {/* 編集ボタン */}
          <div className="md:self-start">
            <Link
              href="/user/profile/edit"
              className="inline-block px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              プロフィールを編集
            </Link>
          </div>
        </div>
      </div>

      {/* 基本情報セクション */}
      <ProfileSection title="基本情報" icon="UserIcon">
        <ProfileField label="ユーザー名" value={profile.userName} />
        <ProfileField label="姓" value={profile.lastName} />
        <ProfileField label="名" value={profile.firstName} />
        <ProfileField
          label="ロール"
          value={<BadgeDisplay role={profile.role} />}
        />
      </ProfileSection>

      {/* 連絡先セクション */}
      <ProfileSection title="連絡先情報" icon="EnvelopeIcon">
        <ProfileField
          label="メールアドレス"
          value={profile.email}
          badge={
            <BadgeDisplay
              verified={profile.emailVerified}
              type="email"
            />
          }
        />
        <ProfileField
          label="電話番号"
          value={profile.phoneNumber || '未設定'}
          badge={
            profile.phoneNumber ? (
              <BadgeDisplay
                verified={profile.phoneNumberVerified}
                type="phone"
              />
            ) : undefined
          }
        />
      </ProfileSection>

      {/* アカウント情報セクション */}
      <ProfileSection title="アカウント情報" icon="InformationCircleIcon">
        <ProfileField
          label="生年月日"
          value={profile.birthday ? formatDate(profile.birthday) : '未設定'}
        />
        <ProfileField
          label="アカウント作成日"
          value={formatDateTime(profile.createdAt)}
        />
        <ProfileField
          label="最終更新日"
          value={formatDateTime(profile.updatedAt)}
        />
      </ProfileSection>
    </div>
  );
}
