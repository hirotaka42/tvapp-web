import ContentCard from '@/components/atomicDesign/atoms/ContentCard';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';

interface ContentCardListProps {
  contents: ConvertedCardViewContent[];
}

export const ContentCardList: React.FC<ContentCardListProps> = ({ contents }) => {
  return (
    <div className="flex flex-row ml-3 mt-2.5 mr-1.5 pl-1 gap-x-4 overflow-x-auto">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          id={content.id}
          title={content.title}
          thumbnail={content.thumbnail.small}
          broadcastDateLabel={content.broadcastDateLabel}
          rank={content.rank}
        />
      ))}
    </div>
  );
};

export default ContentCardList;