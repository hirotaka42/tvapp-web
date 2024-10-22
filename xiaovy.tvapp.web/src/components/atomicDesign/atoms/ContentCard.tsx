import Image from 'next/image';

interface ContentCardProps {
  id: string;
  title: string;
  thumbnail: string;
  broadcastDateLabel: string;
  rank?: number;
}

const ContentCard: React.FC<ContentCardProps> = ({ id, title, thumbnail, broadcastDateLabel, rank }) => {
  return (
    <a
      href={`episode/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center rounded-lg min-w-[164px] max-w-[260px] hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 bg-white"
    >
      <div className="w-1/3 pt-7 sm:w-full flex-shrink-0 aspect-w-16 aspect-h-9 min-h-[92.25px] min-w-[164px] max-h-[146px] max-w-[260px]">
        <Image
          alt={title}
          src={thumbnail}
          width={480}
          height={270}
          className="object-cover rounded-lg sm:rounded-none sm:rounded-t-lg"
        />
      </div>
      <div className="p-0 leading-normal w-2/3 sm:w-full min-w-[164px] max-w-[260px]">
        <h5
          className="text-md font-bold tracking-tight text-gray-900 dark:text-white truncate"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {title}
        </h5>
        <p
          className="font-normal text-gray-700 dark:text-gray-400 truncate"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {broadcastDateLabel}
        </p>
        {(rank !== undefined && rank !== 0) && (
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {rank}位
          </p>
        )}
      </div>
    </a>
  );
};

export default ContentCard;