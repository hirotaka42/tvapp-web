// scripts/check-user-role.js
// Firebase Admin SDKを使用してユーザーのroleを確認するスクリプト

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Firebase Admin SDK初期化
const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON)
  : {
      type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || 'googleapis.com',
    };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

async function checkUserRole(uidOrEmail) {
  try {
    console.log('🔍 ユーザー情報を取得中...\n');

    // UIDかEmailで検索
    let user;
    if (uidOrEmail.includes('@')) {
      user = await auth.getUserByEmail(uidOrEmail);
    } else {
      user = await auth.getUser(uidOrEmail);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ユーザー情報');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`UID: ${user.uid}`);
    console.log(`Email: ${user.email || 'N/A'}`);
    console.log(`Email Verified: ${user.emailVerified}`);
    console.log(`Display Name: ${user.displayName || 'N/A'}`);
    console.log(`Created: ${user.metadata.creationTime}`);
    console.log(`Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Custom Claims (Role情報)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (user.customClaims && user.customClaims.role !== undefined) {
      const role = user.customClaims.role;
      const roleNames = {
        0: '一般ユーザー (GENERAL)',
        1: 'DL有効化 (DL_ENABLED)',
        2: 'TV有効化 (TV_ENABLED)',
        10: 'プレビュー (PREVIEW)',
        99: '特権ユーザー (SUPER_USER)'
      };

      console.log(`Role: ${role} - ${roleNames[role] || 'Unknown'}`);
      console.log(`\nAll Custom Claims:`, JSON.stringify(user.customClaims, null, 2));
    } else {
      console.log('⚠️ Custom Claimsが設定されていません');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  } finally {
    process.exit(0);
  }
}

// コマンドライン引数から取得
const uidOrEmail = process.argv[2];

if (!uidOrEmail) {
  console.error('❌ 使用方法: node scripts/check-user-role.js <UID または Email>');
  console.log('\n例:');
  console.log('  node scripts/check-user-role.js zL1trFvj5waKXpq4dJ8Pf29LWPH3');
  console.log('  node scripts/check-user-role.js admin@example.com');
  process.exit(1);
}

checkUserRole(uidOrEmail);
