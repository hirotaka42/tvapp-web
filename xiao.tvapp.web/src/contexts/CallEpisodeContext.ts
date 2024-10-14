import { createContext } from 'react';
import { ICallEpisodeService } from '@/../src/services/ICallEpisodeService';

export const CallEpisodeServiceContext = createContext<ICallEpisodeService | null>(null);
