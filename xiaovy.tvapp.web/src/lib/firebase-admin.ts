// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Firebase Admin SDKの初期化（シングルトン）
if (!admin.apps.length) {
  try {
    // 環境変数から認証情報を取得（JSON形式または個別形式に対応）
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

    // 必須フィールドのチェック
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.warn('Warning: Firebase Admin SDK credentials are incomplete. Required: project_id, private_key, client_email');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export const adminAuth = admin.apps.length > 0 ? admin.auth() : (null as unknown as ReturnType<typeof admin.auth>);
export const adminDb = admin.apps.length > 0 ? admin.firestore() : (null as unknown as ReturnType<typeof admin.firestore>);
