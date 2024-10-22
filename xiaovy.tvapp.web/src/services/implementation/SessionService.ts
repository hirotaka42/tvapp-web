import { ISessionService } from '@/services/ISessionService';
import { sessionToken } from '@/types/Token';

export class SessionService implements ISessionService {
    async getSessionToken(): Promise<sessionToken> {
      const response = await fetch(`/api/service/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('インターネット接続がありません');
      }
  
      const data: sessionToken = await response.json();
      return data;
    }
}