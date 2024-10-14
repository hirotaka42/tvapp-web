import { useContext } from 'react';
import { StreamingServiceContext } from '@/contexts/StreamingContext';

export function useStreamingService() {
  const streamingService = useContext(StreamingServiceContext);
  if (!streamingService) {
    throw new Error('`useStreamingService` を使用するコンポーネントが `StreamingServiceContext.Provider` でラップされていることを確認してください。');
  }
  return streamingService;
}