import { sessionToken } from "@/../src/types/SessionToken";

export interface ISessionService {
  getSession: () => Promise<sessionToken>;
}