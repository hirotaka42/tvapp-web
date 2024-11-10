import React from 'react';
import GenreContentCard from '@/components/atomicDesign/atoms/GenreContentCard';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface GenreContentCardListProps {
  contents: ConvertedContent[];
}

const GenreContentCardList: React.FC<GenreContentCardListProps> = ({ contents }) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">
      {contents.map((content) => (
        <GenreContentCard
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

export { GenreContentCardList };
export default GenreContentCardList;