import Link from 'next/link';

export function IconLogo() {
  return (
    <Link className="lg" href="/" aria-label="TVapp ホーム">
      <svg width="33" height="33" viewBox="0 0 32 32" aria-hidden="true">
        <rect className="lg-tile" x="1" y="1" width="30" height="30" rx="9" />
        <path className="lg-w" d="M6 13c2.6-3.2 5.2-3.2 7.8 0s5.2 3.2 7.8 0c1.3-1.6 2.8-2.3 4.7-1.5" />
        <path className="lg-w" d="M6 20.5c2.6-3.2 5.2-3.2 7.8 0s5.2 3.2 7.8 0c1.3-1.6 2.8-2.3 4.7-1.5" opacity=".45" />
      </svg>
      <span className="lg-t">
        <span className="lg-wm">TVapp</span>
        <span className="lg-sub">Multi Stream</span>
      </span>
    </Link>
  );
}
