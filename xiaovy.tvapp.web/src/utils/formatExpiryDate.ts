import { VideoDownload } from '@/types/VideoDownload';

/**
 * SASの有効期限日時を取得する
 */
export function getSasExpiryDate(video: VideoDownload): string | null {
  // 新しい構造をチェック
  if (video.sas?.new?.expiry_date) {
    return video.sas.new.expiry_date;
  }
  
  return null;
}

/**
 * 有効期限日時を日本語で分かりやすく表示する
 */
export function formatExpiryDate(expiryDate: string): string {
  try {
    const date = new Date(expiryDate);
    const now = new Date();
    
    // 日本時間に変換
    const jstDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    const jstNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    
    // 期限切れかチェック
    if (jstDate < jstNow) {
      return '期限切れ';
    }
    
    // 残り日数を計算
    const diffTime = jstDate.getTime() - jstNow.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 年月日をフォーマット
    const year = jstDate.getFullYear();
    const month = jstDate.getMonth() + 1;
    const day = jstDate.getDate();
    
    if (diffDays <= 0) {
      return '期限切れ';
    } else if (diffDays === 1) {
      return `明日まで (${month}/${day})`;
    } else if (diffDays <= 7) {
      return `あと${diffDays}日 (${month}/${day})`;
    } else if (diffDays <= 30) {
      return `あと${diffDays}日 (${month}/${day})`;
    } else {
      return `${year}年${month}月${day}日まで`;
    }
  } catch (error) {
    console.error('Error formatting expiry date:', error);
    return expiryDate; // フォーマットに失敗した場合は元の値を返す
  }
}

/**
 * 有効期限の状態を取得（CSS クラス用）
 */
export function getExpiryStatus(video: VideoDownload): 'expired' | 'warning' | 'normal' {
  const expiryDate = getSasExpiryDate(video);
  if (!expiryDate) return 'normal';
  
  try {
    const date = new Date(expiryDate);
    const now = new Date();
    
    // 日本時間に変換
    const jstDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    const jstNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    
    const diffTime = jstDate.getTime() - jstNow.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'expired';
    } else if (diffDays <= 3) {
      return 'warning';
    } else {
      return 'normal';
    }
  } catch {
    return 'normal';
  }
}