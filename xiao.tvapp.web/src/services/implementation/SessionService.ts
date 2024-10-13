
import { ISessionService } from '../ISessionService';
import { platformToken } from '../../types/Token';

export class SessionService implements ISessionService {
    async getSession(): Promise<platformToken> {
      const response = await fetch(`/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data: platformToken = await response.json();
      console.log(data);
      return data;
    }
  }