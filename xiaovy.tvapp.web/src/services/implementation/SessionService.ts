import { ISessionService } from '@/services/ISessionService';
import { sessionToken } from '@/types/Token';

export class SessionService implements ISessionService {
    async getSessionToken(): Promise<sessionToken> {
      const baseUrl = `/api/service/session`;
      const url = `${baseUrl}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('IdToken')}`
        },
      });
  
      if (!response.ok) {
        throw new Error('インターネット接続がありません');
      }
  
      const data: sessionToken = await response.json();
      return data;
    }
}