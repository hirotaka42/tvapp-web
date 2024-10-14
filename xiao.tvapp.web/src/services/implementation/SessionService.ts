
import { ISessionService } from '@/../src/services/ISessionService';
import { sessionToken } from '@/../src/types/SessionToken';

export class SessionService implements ISessionService {
    async getSession(): Promise<sessionToken> {
      const response = await fetch(`/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data: sessionToken = await response.json();
      console.log(data);
      return data;
    }
  }