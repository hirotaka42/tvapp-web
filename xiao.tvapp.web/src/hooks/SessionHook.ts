import { useContext } from 'react';
import { SessionServiceContext } from '@/../src/contexts/SessionContext';

export function useSessionService() {
  const sessionService = useContext(SessionServiceContext);
  if (!sessionService) {
    throw new Error('`useSessionService` を使用するコンポーネントが `SessionServiceContext.Provider` でラップされていることを確認してください。');
  }
  return sessionService;
}