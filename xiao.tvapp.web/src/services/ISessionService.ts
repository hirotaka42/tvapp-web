import { platformToken } from "../models/Token";

// ISessionService.ts
export interface ISessionService {
  getSession: () => Promise<platformToken>;
}