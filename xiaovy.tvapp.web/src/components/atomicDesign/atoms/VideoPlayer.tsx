import React, { useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';
import type { ErrorData } from 'hls.js';
import { canPlayNativeHls } from '@/utils/player/canPlayNativeHls';
import { deriveProgress, type PlayerProgress } from '@/utils/player/deriveProgress';
import { getRetryDecision } from '@/utils/player/retryPolicy';

interface VideoPlayerProps {
  url: string;
  onPlay?: () => void;
  onProgress?: (state: PlayerProgress) => void;
  playing?: boolean;
  controls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onPlay, onProgress, playing = true, controls = true }) => {
  const [clientSide, setClientSide] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setClientSide(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!clientSide || !video || !url) return;

    let cancelled = false;
    retryAttemptRef.current = 0;
    setErrorMessage(null);

    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const cleanupSource = () => {
      clearRetryTimer();
      destroyHls();
      video.removeAttribute('src');
      video.load();
    };

    const setup = async () => {
      const nativeHlsResult =
        video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');

      if (canPlayNativeHls(nativeHlsResult)) {
        video.src = url;
        video.load();
        return;
      }

      const HlsModule = await import('hls.js');
      if (cancelled) return;

      const HlsClass = HlsModule.default;
      if (!HlsClass.isSupported()) {
        setErrorMessage('この環境では動画を再生できません。');
        return;
      }

      const hls = new HlsClass();
      hlsRef.current = hls;

      hls.on(HlsClass.Events.ERROR, (_event: string, data: ErrorData) => {
        if (!data.fatal) return;

        if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
          const decision = getRetryDecision(retryAttemptRef.current);
          retryAttemptRef.current = decision.nextAttempt;

          if (!decision.shouldRetry) {
            setErrorMessage('通信エラーにより動画を再生できませんでした。');
            hls.destroy();
            return;
          }

          clearRetryTimer();
          retryTimerRef.current = setTimeout(() => {
            if (!cancelled) hls.startLoad();
          }, decision.delayMs);
          return;
        }

        if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        setErrorMessage('動画を再生できませんでした。');
        hls.destroy();
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    };

    void setup().catch((error) => {
      console.error('HLS player setup failed:', error);
      setErrorMessage('動画を再生できませんでした。');
    });

    return () => {
      cancelled = true;
      cleanupSource();
    };
  }, [clientSide, url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clientSide) return;

    if (playing) {
      void video.play().catch(() => {
        // Browser autoplay policy can block programmatic play.
      });
    } else {
      video.pause();
    }
  }, [clientSide, playing, url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    const handleProgress = () => {
      const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
      onProgress(
        deriveProgress({
          currentTime: video.currentTime,
          duration: video.duration,
          bufferedEnd,
        }),
      );
    };

    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleProgress);
      video.removeEventListener('progress', handleProgress);
    };
  }, [onProgress]);

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div className='player-wrapper'>
      {clientSide ? (
        <>
          <video
            ref={videoRef}
            className='react-player'
            controls={controls}
            onPlay={handlePlay}
            controlsList="nodownload"
            playsInline
            preload="metadata"
          />
          {errorMessage && (
            <div className="player-error" role="alert">
              {errorMessage}
            </div>
          )}
        </>
      ) : (
        <div className="loading-placeholder">
          <p>読み込み中...</p>
        </div>
      )}
    </div>
  );
};
