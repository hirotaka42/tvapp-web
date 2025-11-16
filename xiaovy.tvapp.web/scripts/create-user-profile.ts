// scripts/create-user-profile.ts
// 既存のFirebase Authユーザーに対してFirestoreプロファイルを作成するスクリプト

import { adminAuth, adminDb } from '../src/lib/firebase-admin';
import { UserRole } from '../src/types/User';

async function createUserProfile(uid: string) {
  try {
    // Firebase Authからユーザー情報を取得
    const userRecord = await adminAuth.getUser(uid);

    console.log('Creating profile for user:', uid);
    console.log('Email:', userRecord.email);

    // Firestoreにユーザープロファイルを作成
    const userProfile = {
      uid: userRecord.uid,
      userName: userRecord.displayName || 'Unknown User',
      email: userRecord.email || '',
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber || null,
      phoneNumberVerified: false,
      role: UserRole.GENERAL,
      firstName: '名',
      lastName: '姓',
      birthday: null,
      createdAt: new Date(userRecord.metadata.creationTime),
      updatedAt: new Date(),
      isAnonymous: userRecord.providerData.length === 0,
    };

    await adminDb.collection('users').doc(uid).set(userProfile);
    console.log('✓ User profile created successfully!');

  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// 実行
const uid = process.argv[2];
if (!uid) {
  console.error('Usage: ts-node scripts/create-user-profile.ts <UID>');
  process.exit(1);
}

createUserProfile(uid)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
