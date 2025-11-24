// scripts/check-firestore-user.js
// Firestoreのusersコレクションからユーザーデータを確認するスクリプト

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

const db = admin.firestore();
const auth = admin.auth();

async function checkFirestoreUser(uidOrEmail) {
  try {
    console.log('🔍 ユーザー情報を取得中...\n');

    // UIDかEmailで検索
    let uid;
    if (uidOrEmail.includes('@')) {
      const user = await auth.getUserByEmail(uidOrEmail);
      uid = user.uid;
      console.log(`📧 Email: ${uidOrEmail} → UID: ${uid}\n`);
    } else {
      uid = uidOrEmail;
    }

    // Firebase Authの情報
    const authUser = await auth.getUser(uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Firebase Auth - Custom Claims');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`UID: ${authUser.uid}`);
    console.log(`Email: ${authUser.email || 'N/A'}`);

    if (authUser.customClaims && authUser.customClaims.role !== undefined) {
      const role = authUser.customClaims.role;
      const roleNames = {
        '-1': 'ゲストユーザー (GUEST)',
        0: '一般ユーザー (GENERAL)',
        1: 'DL有効化 (DL_ENABLED)',
        2: 'TV有効化 (TV_ENABLED)',
        10: 'プレビュー (PREVIEW)',
        99: '特権ユーザー (SUPER_USER)'
      };
      console.log(`Custom Claims Role: ${role} - ${roleNames[role] || 'Unknown'}`);
    } else {
      console.log('⚠️ Custom Claimsにroleが設定されていません');
    }

    // Firestoreの情報
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗄️  Firestore - users コレクション');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.log('❌ Firestoreにユーザードキュメントが存在しません');
    } else {
      const userData = userDoc.data();
      console.log(`UID: ${userData.uid}`);
      console.log(`Email: ${userData.email || 'N/A'}`);
      console.log(`UserName: ${userData.userName || 'N/A'}`);
      console.log(`Nickname: ${userData.nickname || 'N/A'}`);

      const roleNames = {
        '-1': 'ゲストユーザー (GUEST)',
        0: '一般ユーザー (GENERAL)',
        1: 'DL有効化 (DL_ENABLED)',
        2: 'TV有効化 (TV_ENABLED)',
        10: 'プレビュー (PREVIEW)',
        99: '特権ユーザー (SUPER_USER)'
      };

      console.log(`\n📊 Firestore Role: ${userData.role} (type: ${typeof userData.role}) - ${roleNames[userData.role] || 'Unknown'}`);

      console.log('\n🔍 完全なユーザーデータ:');
      console.log(JSON.stringify(userData, null, 2));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// コマンドライン引数から取得
const uidOrEmail = process.argv[2];

if (!uidOrEmail) {
  console.error('❌ 使用方法: node scripts/check-firestore-user.js <UID または Email>');
  console.log('\n例:');
  console.log('  node scripts/check-firestore-user.js zL1trFvj5waKXpq4dJ8Pf29LWPH3');
  console.log('  node scripts/check-firestore-user.js admin@example.com');
  process.exit(1);
}

checkFirestoreUser(uidOrEmail);
