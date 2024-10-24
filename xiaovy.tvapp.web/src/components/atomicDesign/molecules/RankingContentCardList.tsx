import React from 'react';
import RankingContentCard from '@/components/atomicDesign/atoms/RankingContentCard';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface RankingContentCardListProps {
  contents: ConvertedContent[];
}

const RankingContentCardList: React.FC<RankingContentCardListProps> = React.memo(({ contents }) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">
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
});

RankingContentCardList.displayName = 'RankingContentCardList';

export { RankingContentCardList };
export default RankingContentCardList;