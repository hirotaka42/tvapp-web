import { useContext } from 'react';
import { CallEpisodeServiceContext } from '../contexts/CallEpisodeContext';

export function useCallEpisodeService() {
  const callEpisodeService = useContext(CallEpisodeServiceContext);
  if (!callEpisodeService) {
    throw new Error('useCallEpisodeService must be used within a CallEpisodeServiceContext.Provider');
  }
  return callEpisodeService;
}