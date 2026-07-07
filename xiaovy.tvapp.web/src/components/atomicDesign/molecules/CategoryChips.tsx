interface Category {
  label: string;
  href: string;
  current?: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  { label: 'ホーム', href: '/', current: true },
  { label: 'ドラマ', href: '#' },
  { label: 'バラエティ', href: '#' },
  { label: 'アニメ', href: '#' },
  { label: '報道・ドキュメンタリー', href: '#' },
  { label: 'スポーツ', href: '#' },
  { label: '映画', href: '#' },
  { label: '音楽', href: '#' },
  { label: 'マイリスト', href: '/user/favorite' },
];

export function CategoryChips({ categories = DEFAULT_CATEGORIES }: { categories?: Category[] }) {
  return (
    <nav className="tv-cat wrap" aria-label="ジャンル">
      {categories.map((category) => (
        <a key={category.label} href={category.href} aria-current={category.current ? 'page' : undefined}>
          {category.label}
        </a>
      ))}
    </nav>
  );
}
