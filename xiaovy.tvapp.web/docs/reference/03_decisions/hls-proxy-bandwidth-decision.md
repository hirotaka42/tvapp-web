# ADR: HLS プロキシの帯域・課金設計 — 「master のみプロキシ / セグメント直取り」方式の採用

- Status: Proposed(実測に基づく設計判断。実装・本番検証は未)
- Date: 2026-07-07
- Context: PC Chrome での TVER 再生(hls.js)のため全リソースを Worker 経由で中継する
  `/api/service/stream/hls` を導入済み。3 人以上の同時視聴で映像が全部 Cloudflare を経由し、
  Free 枠超過・課金が発生しないかが懸念。

## 1. Cloudflare Workers Free plan の課金モデル(公式 docs で当日確認した事実)

| 項目 | Free plan | 出典 |
|---|---|---|
| リクエスト | **100,000 件/日**(UTC 0時リセット) | workers/platform/limits |
| CPU 時間 | **10 ms/呼び出し**(I/O 待ち=fetch 待ちは**カウントされない**) | 同上 |
| 実時間(wall-clock) | HTTP リクエストには**制限なし**(クライアント接続中はストリーム継続可) | 同上 |
| サブリクエスト | 50 件/リクエスト | 同上 |
| メモリ | 128 MB | 同上 |
| **egress(下り帯域)** | **課金対象外**。「There are no additional charges for data transfer (egress) or throughput (bandwidth)」 | workers/platform/pricing |
| 静的アセット | リクエスト**無料・無制限**(10万/日にカウントされない) | 同上 |
| 超過時 | **課金されない。失敗する**(「further operations of that type will fail with an error」)。ルート型は fail open(Worker素通し)/fail closed(Error 1027)を選択 | limits / pricing |

- 課金軸は「リクエスト数 + CPU ms」(Paid の場合)。**帯域・duration は標準 Workers では課金されない**
  (duration 課金は Durable Objects 側の概念)。
- ストリーム中継(`new Response(upstream.body)` のパススルー)は I/O 待ちが CPU に乗らないため
  CPU 消費は小さい。ただし本アプリは OpenNext(Next.js サーバ)経由でルートが動くためオーバーヘッドが
  上乗せされる。10ms 枠に対する実測余裕は**不確実**(本番ログでの確認推奨)。
- Free plan の分間バースト制限(1000 req/分等)の有無は当日の docs 取得では確認できず。**要公式確認**
  (本設計の規模では抵触しない見込み)。

## 2. リクエスト数の見積り(実測ベース)

実エピソード(ドラマランキング先頭、約 47 分)の実測: **variant プレイリスト 469 セグメント、
TARGETDURATION 6 秒**。

- 全量プロキシ時: 1 視聴 ≒ 470〜480 Worker リクエスト(master + variant + セグメント)。
- 3 人同時視聴 ≒ 約 1,400 リクエスト/話。3 人が 1 日 2〜3 本見ても **3,000〜4,500/日 ≒ 枠の 3〜5%**。
- **結論: 10万/日のリクエスト枠は全量プロキシでも実用上問題にならない。** 3 人同時の分間レートも
  約 30 req/分で微小。懸念があるとすれば (i) OpenNext 経由の CPU 10ms 枠、(ii) CDN 規約上の
  映像中継の面(§4)、(iii) Workers の egress IP(非日本の可能性)からのセグメント取得が
  streaks 側でブロックされ得る点 — いずれも課金ではなく可用性の問題。

## 3. 実測による前提の覆り(重要)

2026-07-07 に実ストリームで CORS を実測した(`Origin` を変えて fetch し応答ヘッダを記録):

| リソース | ホスト | 外部 Origin | Origin なし | tver.jp Origin |
|---|---|---|---|---|
| master.m3u8 | manifest.streaks.jp | **403**(ACAO:`*` は付く) | 200 | 200 |
| variant.m3u8 | variants.streaks.jp | **200 + ACAO:`*`** | — | 200 |
| セグメント(.ts) | vod-tver-ytv.streaks.jp | **200 + ACAO:`*`** | 200(ACAO なし) | 200 |

- 「streaks は CORS 非許可」という前提は**不正確**だった。実態は
  **master プレイリストだけが Origin 値のサーバ側許可リストで 403**(CORS ヘッダ自体は `*` で返る)。
  variant とセグメントは**任意 Origin に 200 + `ACAO:*`** を返し、ブラウザの CORS 検査を通過する。
- master 内の variant 参照、variant 内のセグメント参照はホストが異なるため**絶対 URL**
  (相対では別ホストを指せない)。
- 注意: これは streaks(CloudFront)側の現時点の設定であり、**将来変更され得る**(不確実)。

## 4. 検討した代替案

- **(a) m3u8 だけ書き換え、セグメントは直接取得** — 原案どおりでは master が 403 で不成立だが、
  実測により**「master のみ Worker でプロキシし、variant/セグメントは直接取得」に修正すれば成立**。
  ブラウザからの variant/セグメント fetch は 200 + `ACAO:*` で CORS を通過する。→ **採用**。
- **(b) hls.js の xhrSetup で CORS 回避** — 不可。CORS はブラウザが強制し、`Origin` は
  forbidden header でクライアント JS から偽装できない。`mode: no-cors` は opaque 応答となり
  hls.js/MSE がバイト列を読めない。403 の原因(Origin 値検査)もクライアントからは変えられない。
- **(c) Cache API でセグメントをキャッシュ** — 効果限定。キャッシュヒットしても Worker 呼び出し
  1 件は消費される(10万/日は減らない)し、egress はそもそも課金されない。キャッシュは
  データセンター(colo)ローカルで、workers.dev サブドメインでは機能しない旨の記載もある(要確認)。
  採用案ではセグメントが Worker を通らないため不要。
- **(d) PC でネイティブ `<video src=m3u8>`** — 不可。PC Chrome はネイティブ HLS 非対応
  (MSE + hls.js が必須)。$0 での現実解は「hls.js + 最小プロキシ」以外に見当たらない
  (拡張機能・Electron 等はWebアプリの範囲外)。
- **(e) Azure Functions(日本・Consumption)でプロキシ** — 不利。Azure は下り帯域が課金対象
  (無料枠を超えた分は従量。正確な単価・無料枠は要確認)。約 47 分の視聴で 1 GB 前後 × 人数 × 日数は
  容易に無料枠を超える。egress 非課金の Cloudflare に対して優位性がない。

## 5. 決定

**「master のみプロキシ / variant・セグメントは streaks から直接取得」方式に切り替える。**

- Worker(`/api/service/stream/hls`)は **manifest.streaks.jp の m3u8 だけ**を中継し、
  プレイリスト内 URI は「manifest.streaks.jp を指すものだけプロキシ URL に書き換え、
  それ以外(variants.streaks.jp / vod-*.streaks.jp)は絶対 URL のまま残す」。
- 映像バイト列は Cloudflare を**一切通らない**: リクエスト消費は 1 視聴あたり数件、
  CPU 10ms 枠・CDN 規約面・Workers egress IP の地域問題がすべて視聴経路から消える。
- 現行の全量プロキシ実装は**フォールバックとして温存**(フラグ or クエリで切替)。
  streaks が将来 variant/セグメントにも Origin 検査を広げた場合の保険。

### 実装方針
1. `src/utils/tver/hlsProxy.ts` の `toProxyUrl` を「ホストが `manifest.streaks.jp` の場合のみ
   プロキシ URL、それ以外の streaks ホストは**絶対 URL を返す**(書き換えずに直接参照)」に変更。
   相対 URI は `new URL(uri, playlistUrl)` で絶対化して返す。
2. 全量プロキシ挙動は `?mode=full`(または env フラグ)で残す。既定は直取りモード。
3. プレイヤー側(hls.js)は変更不要(master をプロキシ URL でロードするだけ)。
4. 本番デプロイ後の検証: PC Chrome で再生し、DevTools Network で
   セグメントの取得先が `*.streaks.jp` 直であること・Worker リクエスト数が数件で済むことを確認。
   Workers から manifest.streaks.jp への fetch が本番(CF egress IP)でも 200 で通ることを確認。

## 6. 残リスク・不確実性

- streaks 側の CORS / Origin 検査の設定は**予告なく変わり得る**(フォールバックで緩和)。
- Workers の egress IP は日本とは限らず、manifest.streaks.jp が地域や IP で拒否する可能性
  (現行プロキシ・純TS解決が本番で動いていれば実績あり。本番検証で確認)。
- OpenNext 経由ルートの CPU 実測(10ms 枠)は未計測(採用案では master 1 件のみで影響軽微)。
- Free plan の分間バースト制限の有無は未確認(規模的に抵触見込みなし)。
- Cloudflare Service-Specific Terms は CDN での映像配信を有償サービスなしで行うことを制限する
  条項を持つ(条項は CDN サービスを対象とし、Workers への適用は明記なし)。全量プロキシを
  フォールバックとして使う場合に関係し得る事実として記録する。採用案では映像は Cloudflare を通らない。

## 7. Consequences

- $0 要件: 採用案では課金軸(リクエスト/CPU)への負荷が視聴 1 回あたり数リクエストまで縮小。
  仮に全量プロキシへフォールバックしても、egress 非課金・10万 req/日・超過時は課金でなく失敗、
  という Free plan の性質により**「気づかぬ課金」は発生しない**。
- iOS Safari(ネイティブ再生)は従来どおり。PC Chrome は hls.js + master プロキシで再生。
