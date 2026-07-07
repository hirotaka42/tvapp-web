import Image from 'next/image';

interface CardThumbnailProps {
  src: string;
  title: string;
  seriesTitle: string;
  episodeLabel?: string;
}

export function CardThumbnail({ src, title, seriesTitle, episodeLabel }: CardThumbnailProps) {
  return (
    <div className="tv-th">
      <Image
        src={src}
        alt={title}
        fill
        sizes="258px"
        className="object-cover"
        unoptimized
      />
      <span className="tv-tht">{seriesTitle}</span>
      {episodeLabel && <span className="tv-ep">{episodeLabel}</span>}
    </div>
  );
}
