import type { NextPage, GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { RankingGenreContainer } from '@/components/Molecules/RankingGenreContainer';
import { ContentData } from '@/types/ContentData';
import Header from '@/components/Templates/Header';
import Footer from '@/components/Templates/Footer';

interface RankingPageProps {
  genre: string;
}

interface Content {
  type: string;
  content: ContentData;
  rank: number;
}

interface ComponentType {
  type: string;
  content: {
    id: string;
    version: number;
    title: string;
  }
  contents: Content[];
  thumbnailType: string;
}

export const getServerSideProps: GetServerSideProps<RankingPageProps> = async (context) => {
  if (!context.params || typeof context.params.genre !== 'string') {
    return {
      notFound: true,
    };
  }
  const { genre } = context.params;

  return {
    props: {
      genre,
    },
  };
};

const RankingPage: NextPage<RankingPageProps> = ({ genre }) => {
  const [ranking, setRanking] = useState<ComponentType>({
    type: '',
    content: { id: '', version: 0, title: '' },
    contents: [],
    thumbnailType: ''
  });

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const response = await fetch(`/api/service/call/EpisodeRankingDetail/${genre}`);
        const data = await response.json();
        
        if (data.result && data.result.contents) {
          setRanking(data.result.contents);
        }
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };

    fetchRankingData();
  }, [genre]);

  return (
    <>
      <Header title="tvapp-web V2"/>
      <RankingGenreContainer rankingData={ranking} />
      <Footer domain="tvapp-web V2"/>
    </>
  );
}

export default RankingPage
