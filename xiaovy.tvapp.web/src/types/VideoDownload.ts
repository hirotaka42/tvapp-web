export interface VideoDownload {
  id: string;
  success: boolean;
  blob_name: string;
  blob_url: string;
  sas_url: string;
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