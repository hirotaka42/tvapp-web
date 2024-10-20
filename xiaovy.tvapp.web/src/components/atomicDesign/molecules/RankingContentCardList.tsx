import RankingContentCard from '@/components/atomicDesign/atoms/RankingContentCard';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface RankingContentCardListProps {
  contents: ConvertedContent[];
}

export const RankingContentCardList: React.FC<RankingContentCardListProps> = ({ contents }) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {contents.map((content) => (
        <RankingContentCard
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

export default RankingContentCardList;