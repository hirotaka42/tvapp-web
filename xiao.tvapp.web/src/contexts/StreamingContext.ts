import { createContext } from 'react';
import { IStreamingService } from '@/../src/services/IStreamingService';

export const StreamingServiceContext = createContext<IStreamingService | null>(null);
