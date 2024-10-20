import { createContext } from 'react';
import { IEpisodeService } from '@/services/IEpisodeService';

export const EpisodeServiceContext = createContext<IEpisodeService | null>(null);