-- TVapp 映画ワールド D1 スキーマ (binding: MOVIE_DB / db: tvapp-movie)
-- 公開ステータスは列に焼かず read 時に release_date + now_showing から導出する。
-- 出典: 映画データ取得設計(2026-07-08 実測ベースの統合設計)。全データは自前クロールで日次upsert。

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_ja TEXT NOT NULL,
  title_original TEXT,
  overview TEXT,
  runtime_min INTEGER,
  rating TEXT CHECK (rating IN ('G','PG12','R15+','R18+') OR rating IS NULL),
  genres_json TEXT,                 -- JSON配列 ["アニメ","アクション"]
  screening_formats_json TEXT,      -- JSON配列 ["IMAX","字幕","吹替"](取得できた分のみ・ベストエフォート)
  release_date TEXT,                -- 'YYYY-MM-DD' JST。未定は NULL
  date_precision TEXT NOT NULL DEFAULT 'unknown' CHECK (date_precision IN ('day','month','year','unknown')),
  is_postponed INTEGER NOT NULL DEFAULT 0,
  release_scale TEXT CHECK (release_scale IN ('wide','limited') OR release_scale IS NULL),
  theater_count INTEGER,            -- 上映館数(公開規模導出の裏付け・上映後のみ確定)
  now_showing INTEGER NOT NULL DEFAULT 0,
  screening_end_date TEXT,          -- now_showing が 1→0 に遷移した日(上映終了の目安・任意)
  is_streaming_only INTEGER NOT NULL DEFAULT 0,
  poster_url TEXT,                  -- 2:3 元URL
  poster_r2_key TEXT,               -- R2保存キー(将来の自前配信・v1未使用)
  keyvisual_url TEXT,               -- 16:9 元URL
  keyvisual_r2_key TEXT,
  content_hash TEXT,                -- 変更検知(未変更なら書込スキップ)
  first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_now_showing ON movies(now_showing, release_date);
CREATE INDEX IF NOT EXISTS idx_movies_streaming ON movies(is_streaming_only);

CREATE TABLE IF NOT EXISTS movie_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director','cast')),
  character_name TEXT,           -- 役名(cast のみ)
  billing_order INTEGER,         -- 主要キャストの序列
  UNIQUE(movie_id, person_name, role)
);
CREATE INDEX IF NOT EXISTS idx_credits_movie ON movie_credits(movie_id, role, billing_order);

CREATE TABLE IF NOT EXISTS movie_source_ids (
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  source TEXT NOT NULL,          -- 'eiga_com' | 'tmdb' | 'moviewalker' | 'filmarks' | 'eirin'
  source_key TEXT NOT NULL,      -- そのソースの作品ID(例 eiga.com_103487, tmdb 1311031)
  source_url TEXT,
  PRIMARY KEY (source, source_key)
);
CREATE INDEX IF NOT EXISTS idx_source_ids_movie ON movie_source_ids(movie_id);

CREATE TABLE IF NOT EXISTS movie_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT NOT NULL UNIQUE,     -- feed の guid / id、無ければ link
  source TEXT NOT NULL,          -- 'natalie' | 'eiga_com' | 'realsound' | 'animeanime' | 'cinra'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  summary TEXT,
  published_at TEXT NOT NULL,    -- ISO8601 JST
  news_category TEXT,            -- 'release_date'|'trailer'|'poster'|'cast'|'festival'|'sequel'|'revival'|'stage_greeting'
  is_forward_looking INTEGER NOT NULL DEFAULT 1,  -- これから系=1(興収除外を通過した記事のみ格納)
  thumbnail_url TEXT,
  thumbnail_r2_key TEXT,
  fetched_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_news_published ON movie_news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_category ON movie_news(news_category, published_at);

CREATE TABLE IF NOT EXISTS news_movie_map (
  news_id INTEGER NOT NULL REFERENCES movie_news(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  match_method TEXT,             -- 'tag'(Real Sound category) | 'title_match'
  PRIMARY KEY (news_id, movie_id)
);

CREATE TABLE IF NOT EXISTS popularity_snapshots (
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  source TEXT NOT NULL,          -- 'filmarks' | 'tmdb' | 'youtube' | 'hatena' | 'eiga_com'
  metric TEXT NOT NULL,          -- 'want_to_watch'(Clip!) | 'watched'(Mark!) | 'rating_avg' | 'rating_count' | 'popularity' | 'trailer_views' | 'bookmark_count' | 'access_rank'
  value REAL NOT NULL,
  snapshot_date TEXT NOT NULL,   -- 'YYYY-MM-DD' JST
  PRIMARY KEY (movie_id, source, metric, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_pop_metric_date ON popularity_snapshots(metric, snapshot_date, value);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT NOT NULL,        -- 'YYYY-MM-DD'
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','zero_rows','error')),
  items_seen INTEGER,
  items_upserted INTEGER,
  message TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_date ON ingest_runs(run_date, source);
