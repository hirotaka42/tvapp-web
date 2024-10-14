import { ContentData } from '@/../src/types/ContentData';

export interface ContentObject {
    type: string
    content: ContentData,
    isLater: boolean,
    score: number  
}