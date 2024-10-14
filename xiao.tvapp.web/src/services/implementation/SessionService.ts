
import { ISessionService } from '../ISessionService';
import { sessionToken } from '../../types/SessionToken';

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