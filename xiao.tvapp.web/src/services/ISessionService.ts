// ISessionService.ts
export interface ISessionService {
  getSession: () => Promise<any>;
}