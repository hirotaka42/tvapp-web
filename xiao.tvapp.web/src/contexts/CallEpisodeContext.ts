import { createContext } from 'react';
import { ICallEpisodeService } from '@/services/ICallEpisodeService';

export const CallEpisodeServiceContext = createContext<ICallEpisodeService | null>(null);
