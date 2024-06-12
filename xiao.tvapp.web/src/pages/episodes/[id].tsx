import type { NextPage, GetServerSideProps } from 'next';

interface EpisodePageProps {
  id: string;
}

export const getServerSideProps: GetServerSideProps<EpisodePageProps> = async (context) => {
  if (!context.params || typeof context.params.id !== 'string') {
    return {
      notFound: true,
    };
  }
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};

const EpisodePage: NextPage<EpisodePageProps> = ({ id }) => {
  return (
    <>
    <h1>Episode Page: {id}</h1>
    </>
  )
}


export default EpisodePage
