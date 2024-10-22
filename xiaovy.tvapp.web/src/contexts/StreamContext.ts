import { createContext } from 'react';
import { IStreamService } from '@/services/IStreamService';

export const StreamServiceContext = createContext<IStreamService | null>(null);