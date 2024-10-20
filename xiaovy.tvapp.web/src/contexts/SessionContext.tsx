import React from 'react';
import { ISessionService } from '@/services/ISessionService';

export const SessionServiceContext = React.createContext<ISessionService | undefined>(undefined);