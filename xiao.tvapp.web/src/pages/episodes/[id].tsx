import type { NextPage, GetServerSideProps } from 'next';
import { CallEpisodeService } from '@/../src/services/implementation/CallEpisodeService';
import { CallEpisodeServiceContext } from '@/../src/contexts/CallEpisodeContext';
import { EpisodeItemPageComponent } from '@/../src/components/Templates/EpisodeItemPageComponent';

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
    <CallEpisodeServiceContext.Provider value={CallEpisodeService}>
      <EpisodeItemPageComponent episodeId={id} />
    </CallEpisodeServiceContext.Provider>
    </>
  )
}


export default EpisodePage
