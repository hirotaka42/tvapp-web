interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const className = ['tv-rk', rank === 1 ? 'r1' : '', rank === 2 ? 'r2' : '', rank === 3 ? 'r3' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className} aria-label={`${rank}位`}>
      {rank}
    </span>
  );
}
