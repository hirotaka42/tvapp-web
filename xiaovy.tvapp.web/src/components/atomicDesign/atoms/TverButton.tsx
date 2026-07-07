import Link from 'next/link';
import { ReactNode } from 'react';

interface TverButtonProps {
  variant: 'primary' | 'ghost';
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  iconLeft?: ReactNode;
}

export function TverButton({ variant, href, onClick, children, iconLeft }: TverButtonProps) {
  const className = `tv-btn ${variant === 'primary' ? 'p' : 'g'}`;
  const content = (
    <>
      {iconLeft}
      {children}
    </>
  );

  if (href) {
    return <Link className={className} href={href}>{content}</Link>;
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {content}
    </button>
  );
}
