
import React from 'react';
import { ISessionService } from '@/../src/services/ISessionService';

export const SessionServiceContext = React.createContext<ISessionService | undefined>(undefined);