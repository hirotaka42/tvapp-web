import { createContext } from 'react';
import { ITvHomeService } from '@/../src/services/ITvHomeService';

export const TvHomeServiceContext = createContext<ITvHomeService | null>(null);
