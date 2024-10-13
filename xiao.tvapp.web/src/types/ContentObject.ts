import { ContentData } from './ContentData';

export interface ContentObject {
    type: string
    content: ContentData,
    isLater: boolean,
    score: number  
}