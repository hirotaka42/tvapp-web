import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Cloudflare Workers 向け OpenNext 設定。
// MVP はサーバーキャッシュを持たない(TVER の応答は都度取得)ため、
// incremental cache 等は既定(無効)のままにしている。
export default defineCloudflareConfig({});
