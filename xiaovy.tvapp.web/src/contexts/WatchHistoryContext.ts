// src/contexts/WatchHistoryContext.ts

import { createContext } from 'react';
import { IWatchHistoryService } from '@/services/IWatchHistoryService';

export const WatchHistoryServiceContext = createContext<IWatchHistoryService | null>(null);
