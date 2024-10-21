import { createContext } from 'react';
import { IRankingService } from '@/services/IRankingService';

export const RankingServiceContext = createContext<IRankingService | null>(null);