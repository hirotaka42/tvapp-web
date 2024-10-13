import { platformToken } from "../types/Token";

export interface ISessionService {
  getSession: () => Promise<platformToken>;
}