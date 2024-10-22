import React, { useState, useEffect } from 'react';
import { useRankingService } from '@/hooks/useRanking';
import { convertEpisodeRankingResponse } from '@/utils/Convert/ranking/genreDetail/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

type Tab = {
  title: string;
  query: string;
};

type TabProps = {
  tabs: Tab[];
};

export const TabsWithUnderlineRanking: React.FC<TabProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [rankingData, setRankingData] = useState<ConvertedContent[]>([]);

  const selectedGenre = tabs[activeTab].query;
  const ranking = useRankingService(selectedGenre);

  useEffect(() => {
    if (ranking) {
      const convertedData = convertRankingToCardData(convertEpisodeRankingResponse(ranking));
      setRankingData(convertedData);
    }
  }, [ranking]);

  return (
    <div className="tabs">
      <div className="block overflow-x-auto">
        <ul className="flex mb-2 transition-all duration-300">
          {tabs.map((tab, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(index)}
                className={`inline-block py-4 px-6 text-brack-500 hover:text-gray-800 dark:text-white font-medium border-b-4 border-transparent ${
                  activeTab === index ? 'border-b-indigo-600 text-indigo-600' : 'border-gray-500'
                } tablink whitespace-nowrap text-md font-bold tracking-tight`}
                role="tab"
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        {tabs.map((tab, index) => (
          <div
            key={index}
            role="tabpanel"
            className={`tabcontent ${activeTab === index ? '' : 'hidden'}`}
          >
            {activeTab === index && (
              <RankingContentCardList contents={rankingData} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabsWithUnderlineRanking;