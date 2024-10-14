import { useContext } from 'react';
import { TvHomeServiceContext } from '@/../src/contexts/TvHomeContext';

export function useTvHomeService() {
  const tvHomeService = useContext(TvHomeServiceContext);
  if (!tvHomeService) {
    throw new Error('`useTvHomeService` を使用するコンポーネントが `TvHomeServiceContext.Provider` でラップされていることを確認してください。');
  }
  return tvHomeService;
}