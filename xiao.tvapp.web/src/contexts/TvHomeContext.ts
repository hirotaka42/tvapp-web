import { createContext } from 'react';
import { ITvHomeService } from '@/services/ITvHomeService';

export const TvHomeServiceContext = createContext<ITvHomeService | null>(null);
