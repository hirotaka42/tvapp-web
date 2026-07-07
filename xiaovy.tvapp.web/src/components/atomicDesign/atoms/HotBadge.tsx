interface HotBadgeProps {
  kind: 'up' | 'new' | 'last';
  label: string;
}

export function HotBadge({ kind, label }: HotBadgeProps) {
  const className = ['tv-hot', kind === 'new' ? 'nw' : '', kind === 'last' ? 'lst' : ''].filter(Boolean).join(' ');
  return <span className={className}>{label}</span>;
}
