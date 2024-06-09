import { createContext, Dispatch, SetStateAction } from 'react';

type PageContextType = {
    footerSelectValue: number;
    setFooterSelectValue: Dispatch<SetStateAction<number>>;
    searchInput: string;
    setSearchInput: Dispatch<SetStateAction<string>>;
};

export const PageContext = createContext<PageContextType | null>(null);