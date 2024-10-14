import { createContext, Dispatch, SetStateAction } from 'react';
import { ContentObject } from '@/types/ContentObject';

type SearchContextType = {
    resultObject: ContentObject[] | null;
    setResultObject: Dispatch<SetStateAction<ContentObject[] | null>>;
    keyword: string;
    setKeyword: Dispatch<SetStateAction<string>>;
};

export const SearchContext = createContext<SearchContextType | null>(null);