import { VideoDownload } from '@/types/VideoDownload';

/**
 * SAS URLの詳細情報を取得してデバッグする関数
 */
export function debugSasUrl(video: VideoDownload): void {
  console.log('=== SAS URL Debug Info ===');
  console.log('Video ID:', video.id);
  console.log('SAS URL Type:', typeof video.sas_url);
  
  if (typeof video.sas_url === 'object' && video.sas_url !== null) {
    console.log('New SAS URL:', video.sas_url.new?.key || 'Not available');
    console.log('Old SAS URL:', video.sas_url.old?.key || 'Not available');
    
    // 新しいSAS URLの詳細を分析
    if (video.sas_url.new?.key) {
      const sasUrl = video.sas_url.new.key;
      console.log('New SAS URL Date:', video.sas_url.new.date);
      
      // URLパラメータを解析
      try {
        const url = new URL(sasUrl);
        const params = url.searchParams;
        
        console.log('=== SAS URL Parameters ===');
        console.log('se (Expiry):', params.get('se'));
        console.log('st (Start):', params.get('st'));
        console.log('sp (Permissions):', params.get('sp'));
        console.log('sv (Storage Version):', params.get('sv'));
        console.log('sr (Resource):', params.get('sr'));
        console.log('sig (Signature):', params.get('sig'));
        
        // 現在時刻と比較
        const now = new Date();
        const startTime = params.get('st') ? new Date(params.get('st')!) : null;
        const expiryTime = params.get('se') ? new Date(params.get('se')!) : null;
        
        console.log('=== Time Analysis ===');
        console.log('Current Time (UTC):', now.toISOString());
        console.log('Start Time (st):', startTime?.toISOString() || 'Not set');
        console.log('Expiry Time (se):', expiryTime?.toISOString() || 'Not set');
        
        if (startTime && now < startTime) {
          console.log('❌ ERROR: Current time is before start time!');
          console.log('Time until valid:', Math.ceil((startTime.getTime() - now.getTime()) / 1000), 'seconds');
        }
        
        if (expiryTime && now > expiryTime) {
          console.log('❌ ERROR: SAS URL has expired!');
        }
        
        if (startTime && expiryTime && now >= startTime && now <= expiryTime) {
          console.log('✅ SAS URL is within valid time range');
        }
        
      } catch (error) {
        console.log('❌ Error parsing SAS URL:', error);
      }
    }
    
    // 古いSAS URLがある場合も確認
    if (video.sas_url.old?.key) {
      console.log('Old SAS URL Date:', video.sas_url.old.date);
    }
    
  } else if (typeof video.sas_url === 'string') {
    console.log('Legacy SAS URL:', video.sas_url);
  }
  
  console.log('sas_update_date_utc:', video.sas_update_date_utc || 'Not available');
  console.log('=== End Debug Info ===');
}

/**
 * SAS URLの有効性をチェックする関数
 */
export function validateSasUrl(video: VideoDownload): {
  isValid: boolean;
  reason?: string;
  suggestedUrl?: string;
} {
  const sasUrl = video.sas_url;
  
  if (typeof sasUrl === 'object' && sasUrl?.new?.key) {
    try {
      const url = new URL(sasUrl.new.key);
      const params = url.searchParams;
      const now = new Date();
      
      const startTime = params.get('st') ? new Date(params.get('st')!) : null;
      const expiryTime = params.get('se') ? new Date(params.get('se')!) : null;
      
      // 開始時刻チェック
      if (startTime && now < startTime) {
        return {
          isValid: false,
          reason: `SAS URL not yet valid. Start time: ${startTime.toISOString()}, Current: ${now.toISOString()}`,
          suggestedUrl: sasUrl.old?.key // 古いURLを代替として提案
        };
      }
      
      // 有効期限チェック
      if (expiryTime && now > expiryTime) {
        return {
          isValid: false,
          reason: `SAS URL expired. Expiry time: ${expiryTime.toISOString()}, Current: ${now.toISOString()}`
        };
      }
      
      return { isValid: true };
      
    } catch (error) {
      return {
        isValid: false,
        reason: `Invalid SAS URL format: ${error}`
      };
    }
  }
  
  return {
    isValid: false,
    reason: 'No valid SAS URL structure found'
  };
}