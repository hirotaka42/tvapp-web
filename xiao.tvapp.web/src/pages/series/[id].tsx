import type { NextPage, GetServerSideProps } from 'next';

interface SeriesPageProps {
  id: string;
}

export const getServerSideProps: GetServerSideProps<SeriesPageProps> = async (context) => {
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

const SeriesPage: NextPage<SeriesPageProps> = ({ id }) => {
  return (
    <>
    <h1>Series Page: {id}</h1>
    </>
  )
}


export default SeriesPage
