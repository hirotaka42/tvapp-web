# アイテムページUI改善 実装TODOリスト

## 優先順位と実装順序

優先度: HIGH > MEDIUM > LOW
各タスクは上から順に実装することを推奨します。

---

## Phase 1: 基盤改善（HIGH優先度）

### 1-1. [HIGH] 動画取得と情報表示の分離
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] 46-48行目のローディング条件を修正
  - `!videoUrl`の条件を削除
  - `episode`と`loginUser`のみチェック
- [ ] 動画URL取得状態を独立して管理
- [ ] エピソード情報のみでページをレンダリング可能に

**期待される変更:**
```tsx
// 修正前
if (!videoUrl || !episode || !loginUser) {
    return <div>Loading...</div>;
}

// 修正後
if (!loginUser || !episode) {
    return <div>Loading...</div>;
}
// videoUrlはVideoPlayerコンポーネント内で個別に処理
```

**完了条件:**
- エピソード情報が取得されたら、動画なしでもページが表示される
- 動画の読み込み中もタイトル、説明文が閲覧可能

---

### 1-2. [HIGH] 動画プレイヤーのローディング表示
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] プレイヤー領域にローディングインジケーターを追加（65-72行目付近）
- [ ] `videoUrl`の状態に応じて表示を切り替え
  - ローディング時: スピナーまたはスケルトン表示
  - 取得完了後: VideoPlayerコンポーネント表示
- [ ] ローディング中の背景色を黒に設定

**実装例:**
```tsx
<div style={{
    width: '100vw',
    height: 'calc(100vw * 9 / 16)',
    position: 'relative',
    margin: 'auto',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}}>
    {videoUrl ? (
        <VideoPlayer url={videoUrl.video_url} />
    ) : (
        <div className="loading-spinner">読み込み中...</div>
    )}
</div>
```

**オプション実装:**
- [ ] LoadingSpinnerコンポーネントの作成（`src/components/atomicDesign/atoms/LoadingSpinner.tsx`）
- [ ] CSSアニメーションの追加

**完了条件:**
- 動画が読み込まれている間、プレイヤー領域にローディング表示が出る
- 動画取得完了後、スムーズにVideoPlayerに切り替わる

---

## Phase 2: UI改善（MEDIUM優先度）

### 2-1. [MEDIUM] お気に入りボタンの再配置
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] お気に入りボタンをシリーズタイトルの横に移動（82-85行目付近）
- [ ] ボタンのデザインを改善
  - アイコン表示（★/☆）
  - ホバー効果の追加
  - アクセシビリティ対応（aria-label）
- [ ] レイアウトをflexboxで調整

**実装例:**
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <a href={`/series/${episode.data.seriesID}`}
       className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
        {seriesTitle}
    </a>
    <button
        onClick={() => handleFavoriteClick(seriesTitle, episode.data.seriesID)}
        className="favorite-button text-2xl hover:scale-110 transition-transform"
        aria-label={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
        title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
    >
        {isFavorite ? '★' : '☆'}
    </button>
</div>
```

**完了条件:**
- お気に入りボタンがシリーズタイトルの右側に表示される
- ボタンが視覚的に目立ち、クリックしやすい
- ホバー時に視覚的フィードバックがある

---

### 2-2. [MEDIUM] エピソードリストの表示とカテゴリ分け
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

#### 2-2-1. データ取得の実装
**タスク内容:**
- [ ] `useSessionService`をインポート（既存のhookを使用）
- [ ] `useSeriesService`をインポート
- [ ] シリーズコンテンツの状態管理を追加
- [ ] `convertCardContentsBySeason`関数をインポート
- [ ] エピソードリストの状態を管理

**実装例:**
```tsx
import { useSessionService } from '@/hooks/useSession';
import { useSeriesService } from '@/hooks/useSeries';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';
import { GenreContentCardList } from '@/components/atomicDesign/molecules/GenreContentCardList';

// コンポーネント内
const session = useSessionService();
const [seriesEpisodes, setSeriesEpisodes] = useState<SeasonGroupedContents[] | null>(null);

// seriesIDが取得できたらシリーズコンテンツを取得
const seriesContent = episode ? useSeriesService(episode.data.seriesID, session) : null;

useEffect(() => {
    if (seriesContent) {
        const convertedData = convertCardContentsBySeason(seriesContent);
        setSeriesEpisodes(convertedData);
    }
}, [seriesContent]);
```

#### 2-2-2. UIの実装
**タスク内容:**
- [ ] エピソードリストセクションを追加（コンテンツ情報の下）
- [ ] カテゴリ（シーズン）ごとにセクションを分ける
- [ ] 各セクションにタイトルを表示
- [ ] `GenreContentCardList`コンポーネントを使用してカードを表示

**実装例:**
```tsx
{seriesEpisodes && seriesEpisodes.length > 0 && (
    <div style={{
        width: '95vw',
        margin: 'auto',
        marginTop: '40px'
    }}>
        <h2 className="text-xl font-bold mb-4">エピソード</h2>
        {seriesEpisodes.map((season, index) => (
            <div key={index} className="mb-6">
                <h3 className="text-md font-semibold mb-2">
                    {season.seasonTitle}
                </h3>
                <GenreContentCardList contents={season.contents} />
            </div>
        ))}
    </div>
)}
```

#### 2-2-3. ローディング状態の処理
**タスク内容:**
- [ ] シリーズコンテンツ取得中のローディング表示
- [ ] エラー処理の実装

**完了条件:**
- 動画プレイヤーの下にエピソードリストが表示される
- カテゴリ（シーズン）ごとにセクションが分かれている
- 各エピソードがカード形式で表示される
- エピソードカードをクリックすると該当エピソードページに遷移

---

## Phase 3: 品質向上（LOW優先度）

### 3-1. [LOW] エラーハンドリングの強化
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] 動画URL取得エラー時の表示
- [ ] エピソード情報取得エラー時の表示
- [ ] シリーズコンテンツ取得エラー時の表示（部分的エラー）
- [ ] 各エラーメッセージをユーザーフレンドリーに

**実装例:**
```tsx
{videoUrlError && (
    <div className="error-message">
        動画の読み込みに失敗しました。ページを再読み込みしてください。
    </div>
)}
```

---

### 3-2. [LOW] スタイリングの改善
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] インラインスタイルをTailwind CSSクラスに変更
- [ ] ダークモード対応の確認と調整
- [ ] レスポンシブデザインの確認（モバイル対応）
- [ ] スペーシングの統一

**完了条件:**
- コードが読みやすく、保守性が向上
- すべてのデバイスで適切に表示される

---

### 3-3. [LOW] パフォーマンス最適化
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] 不要な再レンダリングの防止（useMemo, useCallbackの活用）
- [ ] エピソードカードの遅延ロード（Intersection Observer）
- [ ] 画像の最適化（lazy loading）

---

### 3-4. [LOW] アクセシビリティの向上
**ファイル**: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`

**タスク内容:**
- [ ] ローディング状態に`aria-busy`属性を追加
- [ ] セマンティックHTMLの使用（section, article, navなど）
- [ ] キーボードナビゲーションの確認
- [ ] スクリーンリーダー対応の確認

---

## 実装の進め方

### ステップ1: 環境確認
1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:3000/episode/ep6t0yi00r` を開く
3. 現在の動作を確認

### ステップ2: Phase 1の実装
1. タスク1-1を実装
2. ブラウザで動作確認
3. タスク1-2を実装
4. ブラウザで動作確認

### ステップ3: Phase 2の実装
1. タスク2-1を実装
2. ブラウザで動作確認
3. タスク2-2を実装（2-2-1 → 2-2-2 → 2-2-3の順）
4. ブラウザで動作確認

### ステップ4: Phase 3の実装（時間があれば）
1. 各タスクを順次実装
2. 都度動作確認

### テスト観点
- [ ] エピソード情報が動画より先に表示されるか
- [ ] 動画読み込み中にローディング表示が出るか
- [ ] お気に入りボタンがわかりやすい位置にあるか
- [ ] エピソードリストが正しくカテゴリ分けされているか
- [ ] 各エピソードカードから遷移できるか
- [ ] モバイルでも適切に表示されるか
- [ ] ダークモードで表示が崩れないか

---

## 注意事項
- 既存の機能を壊さないように慎重に実装
- 各フェーズ完了後にgit commitを推奨
- エラーが発生した場合は、設計書を参照して原因を特定
- 必要に応じて設計書の内容を更新

## 参考ファイル
- 設計書: `docs/上流工程/設計/アイテムページ/UI改善設計書.md`
- 現在のページ: `xiaovy.tvapp.web/src/app/episode/[episodeId]/page.tsx`
- シリーズページ（参考実装）: `xiaovy.tvapp.web/src/app/series/[seriesId]/page.tsx`
- カードリストコンポーネント: `xiaovy.tvapp.web/src/components/atomicDesign/molecules/GenreContentCardList.tsx`
