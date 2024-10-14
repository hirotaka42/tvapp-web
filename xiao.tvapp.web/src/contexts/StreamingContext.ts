import { createContext } from 'react';
import { IStreamingService } from '@/services/IStreamingService';

export const StreamingServiceContext = createContext<IStreamingService | null>(null);
