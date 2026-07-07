import Image from 'next/image';
import Link from 'next/link';

interface GenreContentCardProps {
  id: string;
  seriesTitle?: string;
  title: string;
  thumbnail: string;
  endAt: number;
  productionProviderName: string;
  broadcastDateLabel: string;
  rank?: number;
}

const GenreContentCard: React.FC<GenreContentCardProps> = (props) => {
  const { id, seriesTitle, title, thumbnail, productionProviderName, broadcastDateLabel, rank } = props;
  return (
    <Link
      href={`/episode/${id}`}
      className="group flex flex-row items-center gap-3 rounded-lg p-2 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800 sm:flex-col sm:items-stretch sm:gap-0 sm:p-1"
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:w-full">
        <Image
          alt={title}
          src={thumbnail}
          fill
          sizes="(max-width: 640px) 128px, 240px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          unoptimized
        />
        {rank !== undefined && rank !== 0 && (
          <Image
            alt={`${rank}位`}
            src={`https://tver.jp/images/PC_img_ranking_${rank}.svg`}
            width={40}
            height={40}
            className="absolute left-1 top-1 h-10 w-10"
            unoptimized
          />
        )}
      </div>
      <div className="min-w-0 flex-1 sm:px-1 sm:py-2">
        <h5 className="truncate text-sm font-bold tracking-tight text-gray-900 dark:text-white">
          {seriesTitle}
        </h5>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {productionProviderName} {broadcastDateLabel}
        </p>
      </div>
    </Link>
  );
};

export default GenreContentCard;
