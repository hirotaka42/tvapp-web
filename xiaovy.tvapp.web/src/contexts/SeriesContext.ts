import { createContext } from 'react';
import { ISeriesService } from '@/services/ISeriesService';

export const SeriesServiceContext = createContext<ISeriesService | null>(null);