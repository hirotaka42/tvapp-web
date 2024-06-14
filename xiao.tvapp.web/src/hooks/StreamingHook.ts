import { useContext } from 'react';
import { StreamingServiceContext } from '../contexts/StreamingContext';

export function useStreamingService() {
  const streamingService = useContext(StreamingServiceContext);
  if (!streamingService) {
    throw new Error('useStreamingService must be used within a StreamingServiceContext.Provider');
  }
  return streamingService;
}