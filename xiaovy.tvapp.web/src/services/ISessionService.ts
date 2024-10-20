import { sessionToken } from '@/types/Token';

export interface ISessionService {
  getSessionToken: () => Promise<sessionToken>;
}