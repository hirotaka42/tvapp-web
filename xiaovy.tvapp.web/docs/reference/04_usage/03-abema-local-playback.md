# ABEMA アプリ内再生 — ローカル実行の使用書

対象: `feature/tvapp-nextjs-upgrade-cicd`（未マージ）。ABEMA のブラウズ（番組表・VODランキング）・
アプリ内再生（ライブ + VOD）・番組情報表示・親シリーズ/シーズン/話数の辿りを、ローカルで動かす手順。

> 本番 Azure リゾルバは現状鍵を返さないため、**ローカルはローカルリゾルバ経由**で再生する。
> 本番修正は `HANDOVER.md` の「本番Azure」節を参照（要 az login）。

## 1. 構成（どこで何が起きるか）

- **ブラウズ（トークンのみで完結・Python不要）**
  - 認証: `src/lib/abema/auth.ts` が yt-dlp の `_generate_aks` を移植し `POST api.abema.io/v1/users` で user token を取得（module-scope キャッシュ）。
  - VODランキング: `/api/service/abema/vod/ranking` → `user-content-api.p-c3-e.abema-tv.com/v1/modules?spotId=xRKNUGRQ`（8棚）。
  - 番組メタ: `/api/service/abema/vod/program?id=` → `api.abema.io/v1/video/programs/{id}`。
  - シリーズ: `/api/service/abema/vod/series?id=` → `/v1/video/series/{id}` + 各シーズンを**フル seasonId** で個別取得（`?seasonId=149-11_s2` のようにフルID。短縮IDは0件）。
  - 話数解決: `/api/service/abema/vod/episode?contentId=&contentType=` → シリーズ/シーズン→再生用 episodeId。
- **再生（master m3u8 + 導出済AES鍵が必要）**
  - `/api/service/abema/streaminglink` → リゾルバ（`AZURE_FUNCTION_STREEAMING`）が `{manifest_dict, keys}` を返す。
  - `/api/service/abema/hls` が m3u8 を中継し、鍵URIを `/api/service/abema/key` に書換（セグメントはCDN直取り＝帯域ゼロ）。
  - `/api/service/abema/key` が導出済み16byte鍵を返す。
  - これら再生系3ルートは `src/middleware.ts` の**公開許可リスト**に入れてある（プレイヤーは認可ヘッダを付けられないため。TVERの stream/hls と同種）。

## 2. ローカル起動手順

```bash
# 1) ローカルリゾルバ（JP家庭回線 + .venv で ABEMA 鍵導出が通る）
cd tvapp-service/Platform-Stream-Loader
source .venv/bin/activate
python scripts/local_resolver_server.py            # http://127.0.0.1:7071（src 自動検出）

# 2) tvapp-web（別ターミナル・.env.local は非破壊のためインラインで渡す）
cd tvapp-service/tvapp-web/xiaovy.tvapp.web
NEXT_PUBLIC_DEV_BYPASS_AUTH=1 AZURE_FUNCTION_STREEAMING=http://localhost:7071 npm run dev
```

- ブラウザで開き、ヘッダの **ABEMA タブ**に切替（内部的には localStorage `tvapp-svc-v2=abema`）。
- トップの大きいヒーローは「今日の総合ランキング / アニメランキング」の1〜3位からランダム表示。
- ビデオランキングのカード or ヒーローをクリック → 話数解決 → アプリ内再生ページへ。
- 再生ページに番組情報（シリーズ/シーズン/話数/あらすじ）と「シリーズ・全話を見る」導線。

## 3. 落とし穴（重要）: 長時間起動のリゾルバは鍵が狂う

- 症状: マニフェスト・鍵・セグメントは全部200で取れるのに、`readyState=0` のまま再生されない（エラーも出ない）。
- 原因: yt-dlp が `AbemaTVBaseIE._MEDIATOKEN` をプロセス内クラス属性で使い回し、失効すると **16byteだが復号できない誤った鍵**を出す。
- 応急: リゾルバ・サーバーを再起動する（新鮮なトークンで直る）。
- 恒久修正: `Platform-Stream-Loader` の **`fix/abema-fresh-media-token`** ブランチ（`resolve_abema_stream` 冒頭で `_MEDIATOKEN` リセット・要マージ）。
- 切り分け手法: 「サーバから鍵とセグメントを取り AES-128-CBC 復号し、先頭 `0x47`・188バイト周期のTS同期が並ぶか」を見るのが確実（headlessブラウザの可否判定より速い）。

## 4. 要マージのブランチ

- tvapp-web: `feature/tvapp-nextjs-upgrade-cicd`（本機能一式）。
- Platform-Stream-Loader: `fix/abema-fresh-media-token`（鍵の恒久修正・重要）/ `chore/local-resolver-dev-shim`（ローカル起動シム）。

## 5. 本番へ（後続）

本番 Azure が鍵を返すようになったら、tvapp-web の `AZURE_FUNCTION_STREEAMING` を本番 Azure に戻し、
`feature → main → 本番` の順で最終確認する。VOD/ライブは同一の鍵導出パスなので、本番が鍵を返せば両方通る。
