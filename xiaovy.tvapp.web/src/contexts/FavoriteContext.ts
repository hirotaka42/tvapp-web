// src/contexts/FavoriteContext.ts

import { createContext } from 'react';
import { IFavoriteService } from '@/services/IFavoriteService';

export const FavoriteServiceContext = createContext<IFavoriteService | null>(null);
