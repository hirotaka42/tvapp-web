import { useContext } from 'react';
import { TvHomeServiceContext } from '../contexts/TvHomeContext';

export function useTvHomeService() {
  const tvHomeService = useContext(TvHomeServiceContext);
  if (!tvHomeService) {
    throw new Error('useTvHomeService must be used within a TvHomeServiceContext.Provider');
  }
  return tvHomeService;
}