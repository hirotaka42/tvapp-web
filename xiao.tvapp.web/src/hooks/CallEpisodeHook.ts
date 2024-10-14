import { useContext } from 'react';
import { CallEpisodeServiceContext } from '@/../src/contexts/CallEpisodeContext';

export function useCallEpisodeService() {
  const callEpisodeService = useContext(CallEpisodeServiceContext);
  if (!callEpisodeService) {
    throw new Error('`useCallEpisodeService` を使用するコンポーネントが `CallEpisodeServiceContext.Provider` でラップされていることを確認してください。');
  }
  return callEpisodeService;
}