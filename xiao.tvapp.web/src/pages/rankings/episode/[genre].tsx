import type { NextPage, GetServerSideProps } from 'next';

interface RankingPageProps {
  genre: string;
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
  return (
    <>
    <h1>Ranking Page: {genre}</h1>
    <p>作成中</p>
    </>
  )
}

export default RankingPage
