import { ContentData } from '@/types/ContentData';

export interface ContentObject {
    type: string
    content: ContentData,
    isLater: boolean,
    score: number  
}