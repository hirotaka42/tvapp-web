export interface VideoDownload {
  id: string;
  format_version: string;
  success: boolean;
  blob_name: string;
  blob_url: string;
  sas?: {
    new: {
      url: string;
      key: string;
      expiry_days: string;
      expiry_date: string;
    };
    public: {
      url: string;
      key: string;
      expiry_days: string;
      expiry_date: string;
    };
  };
  // 古い形式との互換性のため
  sas_url?: {
    new: {
      date: string;
      key: string;
    };
    old: {
      date: string;
      key: string;
    };
  } | string;
  sas_update_date_utc?: string;
  created_at?: string;
  updated_at?: string;
  metadata: {
    original_url: string;
    service_id: string;
    title: string;
    duration: string;
    upload_date: string;
    uploader: string;
    quality: string;
    file_size: string;
    original_filename: string;
    processed_date: string;
    thumbnail?: string;
    description?: string;
    series?: string;
    season?: string;
    season_number?: number;
    episode_number?: number;
    episode?: string;
  };
  video_info: {
    title: string;
    duration: number;
    thumbnail: string;
    description: string;
  };
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
}

export interface VideoDownloadResponse {
  success: boolean;
  data: VideoDownload[];
  error?: string;
}