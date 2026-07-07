import Image from 'next/image';
import Link from 'next/link';

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
    <Link
      href={`/episode/${id}`}
      className="group flex w-40 shrink-0 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-52"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <Image
          alt={title}
          src={thumbnail}
          fill
          sizes="(max-width: 640px) 160px, 208px"
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
      <div className="px-1 py-2">
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

export default ContentCard;
