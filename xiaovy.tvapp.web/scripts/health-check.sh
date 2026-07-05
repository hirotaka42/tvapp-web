#!/usr/bin/env bash
# TVapp ローカル生存チェック(念入り版)
# 使い方: bash scripts/health-check.sh [PORT]   (既定 3000)
# 目的: 「動いているように見えて実は死んでいる」を検出する。
#   - dev プロセスの生死 / ポート待受
#   - 主要ページと API の実 HTTP ステータス(200 以外は失敗)
#   - TVER セッション〜ストリーム解決の実データ経路
#   - 直近ログのエラー / 404
# 終了コード 0=健全 / 1=異常。

set -uo pipefail
PORT="${1:-3000}"
BASE="http://localhost:${PORT}"
FAIL=0
ok(){ printf '  \033[32m✓\033[0m %s\n' "$1"; }
ng(){ printf '  \033[31m✗ %s\033[0m\n' "$1"; FAIL=1; }

echo "== 1) プロセス / ポート =="
if pgrep -f "next dev|next-server|wrangler dev|\.open-next" >/dev/null 2>&1; then ok "サーバープロセス 稼働"; else ng "サーバープロセスが見つからない"; fi
if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then ok "ポート ${PORT} 待受中"; else ng "ポート ${PORT} が待受していない"; fi

echo "== 2) ページ / API の HTTP ステータス =="
check(){ # path expected
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE}$1" 2>/dev/null)
  if [ "$code" = "$2" ]; then ok "$1 -> $code"; else ng "$1 -> ${code:-無応答} (期待 $2)"; fi
}
check "/api/health" 200
check "/" 200
check "/user/login" 200

echo "== 3) TVER 実データ経路(session -> streaminglink) =="
SES=$(curl -s --max-time 10 -X POST "${BASE}/api/service/session" -H "Authorization: Bearer healthcheck" 2>/dev/null)
PUID=$(printf '%s' "$SES" | python3 -c "import sys,json;print(json.load(sys.stdin).get('platformUid',''))" 2>/dev/null)
if [ -n "$PUID" ]; then ok "session 発行 OK"; else ng "session 発行 NG"; fi
EP=$(curl -s --max-time 10 "https://service-api.tver.jp/api/v1/callEpisodeRankingDetail/drama" \
  -H 'x-tver-platform-type: web' -H 'Origin: https://tver.jp' -H 'Referer: https://tver.jp/' 2>/dev/null \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['result']['contents']['contents'][0]['content']['id'])" 2>/dev/null)
if [ -n "$EP" ]; then
  VU=$(curl -s --max-time 15 "${BASE}/api/service/call/streaminglink?episodeId=${EP}" -H "Authorization: Bearer healthcheck" 2>/dev/null \
    | python3 -c "import sys,json;print(json.load(sys.stdin).get('video_url',''))" 2>/dev/null)
  case "$VU" in
    https://*.m3u8*) ok "streaminglink 解決 OK (${EP})" ;;
    *) ng "streaminglink 解決 NG (${EP}) 応答: ${VU:0:60}" ;;
  esac
else
  ng "ランキングからエピソードID取得に失敗(TVER到達不可?)"
fi

echo "== 4) 直近ログのエラー(任意: 引数 LOG=path) =="
if [ -n "${LOG:-}" ] && [ -f "${LOG}" ]; then
  ERRS=$(tail -80 "${LOG}" | sed 's/\x1b\[[0-9;]*m//g' | grep -iE '⨯|Error:|Unhandled|Segmentation|ECONN| 500 | 404 ' | grep -viE 'line-clamp|Proxy environment|middleware.*deprecated' | tail -8)
  if [ -z "$ERRS" ]; then ok "直近ログにエラーなし"; else ng "直近ログにエラーあり:"; printf '%s\n' "$ERRS"; fi
else
  echo "  (LOG 未指定のためログ走査はスキップ)"
fi

echo "==============================="
if [ "$FAIL" -eq 0 ]; then printf '\033[32m健全: すべて OK\033[0m\n'; exit 0; else printf '\033[31m異常あり: 上記の ✗ を確認\033[0m\n'; exit 1; fi
