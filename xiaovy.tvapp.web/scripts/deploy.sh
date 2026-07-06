#!/usr/bin/env bash
# TVapp 安全デプロイ(古い成果物の誤デプロイを構造的に防ぐ)
#
# なぜ必要か: `opennextjs-cloudflare deploy` は「ビルド済み .open-next をデプロイする」だけで
#   再ビルドしない。古い .open-next を上げ続けて「デプロイしたのに中身が古い」事故が起きた。
#
# このスクリプトの保証:
#   1) 未コミット変更があれば中断(本番=コミット済みコードを担保)
#   2) 古い .open-next / .next を必ず削除して新規ビルド
#   3) git SHA を BUILD_SHA として埋め込みデプロイ
#   4) デプロイ後に本番 /api/health の build_sha が HEAD と一致するか照合し、
#      不一致なら失敗(=古い成果物のデプロイを検出)
#
# 使い方: npm run deploy:safe   (任意で DEPLOY_URL=... を上書き指定可)

set -euo pipefail
cd "$(dirname "$0")/.."

# 1) 未コミット変更(コードと設定)チェック
DIRTY=$(git status --porcelain -- src package.json package-lock.json wrangler.jsonc open-next.config.ts next.config.mjs tsconfig.json 2>/dev/null || true)
if [ -n "$DIRTY" ]; then
  echo "✗ 未コミットの変更があります。コミットしてからデプロイしてください:"
  echo "$DIRTY"
  exit 1
fi

SHA=$(git rev-parse --short HEAD)
echo "== デプロイ対象コミット: $SHA =="

# 2) 古い成果物を必ず削除 → 新規ビルド
echo "== 古いビルド成果物(.open-next/.next)を削除して再ビルド =="
rm -rf .open-next .next
npm run cf:build

# 3) SHA を埋め込んでデプロイ(--var は wrangler ランタイム変数)
echo "== wrangler deploy (BUILD_SHA=$SHA) =="
OUT=$(npx wrangler deploy --var BUILD_SHA:"$SHA" 2>&1)
echo "$OUT" | grep -vE 'Proxy environment' || true
URL=$(printf '%s' "$OUT" | grep -oE 'https://[A-Za-z0-9._-]+\.workers\.dev' | head -1)
[ -z "$URL" ] && URL="${DEPLOY_URL:-}"
if [ -z "$URL" ]; then
  echo "✗ 公開URLを特定できませんでした。DEPLOY_URL を指定して再実行してください。"
  exit 1
fi

# 4) デプロイ後の鮮度照合(エッジ反映待ちのため最大~48s リトライ)
echo "== 鮮度照合: $URL/api/health =="
LIVE="?"
for i in $(seq 1 12); do
  sleep 4
  LIVE=$(curl -s --max-time 20 "$URL/api/health" | python3 -c "import sys,json;print(json.load(sys.stdin).get('build_sha','?'))" 2>/dev/null || echo "?")
  [ "$LIVE" = "$SHA" ] && break
  echo "  ...反映待ち(${i}) 現状 build_sha=$LIVE"
done
echo "  本番 build_sha: $LIVE / 期待(HEAD): $SHA"
if [ "$LIVE" = "$SHA" ]; then
  echo "✓ 最新コミットが本番に反映されました($SHA)"
  echo "  → $URL"
else
  echo "✗ 不一致! 本番=$LIVE 期待=$SHA。古い成果物がデプロイされた可能性があります。要調査。"
  exit 1
fi
