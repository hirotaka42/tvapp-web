import Image from 'next/image';

interface ContentCardProps {
  id: string;
  seriesTitle?: string;
  title: string;
  thumbnail: string;
  endAt: number;
  productionProviderName: string;
  broadcastDateLabel: string;
  rank?: number;
}

const ContentCard: React.FC<ContentCardProps> = (props) => {
  const { id, seriesTitle, title, thumbnail, productionProviderName, broadcastDateLabel, rank } = props;
  return (
    <a
      href={`/episode/${id}`}
      className="flex flex-col items-center rounded-lg min-w-[164px] max-w-[260px] hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 bg-white"
    >
      <div className="relative w-1/3 pt-7 sm:w-full flex-shrink-0 aspect-w-16 aspect-h-9 min-h-[92.25px] min-w-[164px] max-h-[146px] max-w-[260px]">
        <Image
          alt={title}
          src={thumbnail}
          width={480}
          height={270}
          className="object-cover rounded-lg sm:rounded-none sm:rounded-t-lg"
          unoptimized
        />
        {(rank !== undefined && rank !== 0) && (
        <Image
          alt={`${rank}位`}
          src={`https://tver.jp/images/PC_img_ranking_${rank}.svg`}
          width={48}  // 適切なサイズに調整
          height={48} // 適切なサイズに調整
          className="absolute -translate-x-1/3 -translate-y-1/7 min-h-12 max-h-12 min-w-12 max-w-12 left-0 top-0"
          unoptimized
        />
        )}
      </div>
      <div className="p-0 leading-normal w-2/3 sm:w-full min-w-[164px] max-w-[260px]">
        <h5
          className="text-md font-bold tracking-tight text-gray-900 dark:text-white truncate"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {seriesTitle}
        </h5>
        <p
          className="font-normal text-gray-700 dark:text-gray-400 truncate"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {title}
        </p>
        <p
          className="font-normal text-gray-700 dark:text-gray-400 truncate"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {productionProviderName} {broadcastDateLabel}
        </p>
      </div>
    </a>
  );
};

export default ContentCard;