import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // ライブ疎通テスト(TVER実APIに接続)は既定で除外。
    // 実行するときは TVER_LIVE=1 を付ける(package.json の test:live)。
    exclude: process.env.TVER_LIVE
      ? []
      : ['**/node_modules/**', '**/*.live.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
