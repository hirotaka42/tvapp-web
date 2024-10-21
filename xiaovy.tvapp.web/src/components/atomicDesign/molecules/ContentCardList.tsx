import ContentCard from '@/components/atomicDesign/atoms/ContentCard';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface ContentCardListProps {
  contents: ConvertedContent[];
}

export const ContentCardList: React.FC<ContentCardListProps> = ({ contents }) => {
  return (
    <div className="mt-6 flex flex-row gap-x-4 overflow-x-auto">
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