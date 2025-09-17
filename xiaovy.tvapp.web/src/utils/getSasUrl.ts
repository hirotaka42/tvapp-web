import { VideoDownload } from '@/types/VideoDownload';

/**
 * VideoDownloadオブジェクトから再生用のSAS URLを取得する
 * 最新構造（sas.new.url）を最優先し、古い構造にも対応
 */
export function getSasUrl(video: VideoDownload): string {
  // 最新の構造をチェック: sas.new.url
  if (video.sas?.new?.url) {
    return video.sas.new.url;
  }
  
  // 旧構造をチェック: sas_url.new.key
  if (video.sas_url && typeof video.sas_url === 'object' && video.sas_url.new?.key) {
    return video.sas_url.new.key;
  }
  
  // さらに古い構造をチェック: sas_url文字列
  if (video.sas_url && typeof video.sas_url === 'string') {
    return video.sas_url;
  }
  
  // どれもない場合はblob_urlをフォールバックとして使用
  return video.blob_url || '';
}

/**
 * 公開用SAS URLを取得する（必要に応じて）
 */
export function getPublicSasUrl(video: VideoDownload): string | null {
  if (video.sas?.public?.url) {
    return video.sas.public.url;
  }
  return null;
}

/**
 * 古いSAS URLも取得可能にする（必要に応じて）
 */
export function getOldSasUrl(video: VideoDownload): string | null {
  if (video.sas_url && typeof video.sas_url === 'object' && video.sas_url.old?.key) {
    return video.sas_url.old.key;
  }
  return null;
}