import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  // React コンポーネントは esbuild の自動 JSX 変換(esbuild.jsx='automatic')で処理。
  // @vitejs/plugin-react は vite 本体を要求するため使わない。
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    // jsdom で React コンポーネントのテストも可能に(ロジックは node でも動く)
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // ライブ疎通テスト(TVER実APIに接続)は既定で除外。
    // 実行するときは TVER_LIVE=1 を付ける(package.json の test:live)。
    exclude: process.env.TVER_LIVE
      ? ['**/node_modules/**']
      : ['**/node_modules/**', '**/*.live.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json-summary', 'html'],
      // カバレッジ対象は「テスト可能な純ロジック層」。ここに 80% を厳格に課す(CI で下回れば失敗)。
      // 対象: TVER 中核(lib/tver)・機能フラグ・純関数の utils。
      // 除外: firebase 初期化(副作用)・段階2で退避したサービス実装・型/インターフェース。
      include: ['src/lib/**', 'src/utils/**'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.live.test.ts',
        'src/**/*.d.ts',
        'src/types/**',
        'src/lib/firebase.ts',
        'src/lib/firebase-admin.ts',
        'src/utils/debugSasUrl.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
