import { useContext, useEffect, useState } from 'react';
import { SessionServiceContext } from '@/contexts/SessionContext';
import { sessionToken } from '@/types/Token';

export function useSessionService() {
  const sessionService = useContext(SessionServiceContext);

  if (!sessionService) {
    throw new Error('\`useSession\` を使用するコンポーネントが \`SessionServiceContext.Provider\` でラップされていることを確認してください。');
  }

  const [sessionToken, setSessionToken] = useState<sessionToken | null>(null);

  useEffect(() => {
    const fetchSessionToken = async () => {
      const sessionData = await sessionService.getSessionToken();
      setSessionToken(sessionData);
      console.log('Tokenが取得されました');
    };

    fetchSessionToken();
  }, [sessionService]);

  return sessionToken;
}