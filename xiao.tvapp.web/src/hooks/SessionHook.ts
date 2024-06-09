// useSessionService.ts
import { useContext } from 'react';
import { SessionServiceContext } from '../contexts/SessionContext';

export function useSessionService() {
  const sessionService = useContext(SessionServiceContext);
  if (!sessionService) {
    throw new Error('useSessionService must be used within a SessionServiceContext.Provider');
  }
  return sessionService;
}