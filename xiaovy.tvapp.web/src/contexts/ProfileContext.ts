import React from 'react';
import { IProfileService } from '@/services/IProfileService';

export const ProfileServiceContext = React.createContext<IProfileService | undefined>(undefined);
