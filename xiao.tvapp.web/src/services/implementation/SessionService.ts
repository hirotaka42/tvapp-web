
import { ISessionService } from '../ISessionService';
import { platformToken } from '../../models/Token';

export class SessionService implements ISessionService {
    async getSession(): Promise<platformToken> {
      const response = await fetch('https://localhost:7044/api/TVapp/session', {
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