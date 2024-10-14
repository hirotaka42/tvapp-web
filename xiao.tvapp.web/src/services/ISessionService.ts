import { sessionToken } from "../types/SessionToken";

export interface ISessionService {
  getSession: () => Promise<sessionToken>;
}