import { deriveExpiryLabel } from '@/utils/tver/homeView/deriveExpiryLabel';

interface ExpiryLabelProps {
  endAt?: number;
}

export function ExpiryLabel({ endAt }: ExpiryLabelProps) {
  const label = deriveExpiryLabel(endAt);
  if (!label) return null;
  return <span className="tv-lf">{label}</span>;
}
