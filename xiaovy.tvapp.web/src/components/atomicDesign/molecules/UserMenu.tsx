'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeToggleSwitch } from '@/app/themeToggleSwitch';
import { ProfileAvatar } from '@/components/atomicDesign/atoms/ProfileAvatar';
import { ConfirmationModal } from '@/components/atomicDesign/molecules/ConfirmationModal';
import { useFirebaseAuth } from '@/contexts/AuthContext';

function icon(path: React.ReactNode) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {path}
    </svg>
  );
}

export function UserMenu() {
  const { user, clearAllAuthState } = useFirebaseAuth();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const email = user?.email || 'guest@example.com';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await clearAllAuthState();
      setOpen(false);
      toast.success('ログアウトしました');
      router.push('/user/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  return (
    <div className="hd-u" ref={rootRef}>
      <button
        className="hd-ub"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`アカウントメニュー(${userName}さん、ログイン中)`}
        onClick={() => setOpen((current) => !current)}
      >
        <ProfileAvatar photoURL={user?.photoURL ?? null} userName={userName} size="xs" className="hd-av" />
        <span className="hd-un">{userName}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="hd-um" role="menu" aria-label="アカウント">
          <div className="hd-um-h">
            <b>{userName} さん</b>
            <span>{email}</span>
          </div>
          <Link href="/user/profile" role="menuitem">{icon(<><circle cx="8" cy="5.2" r="2.7" /><path d="M2.8 13.4c.9-2.6 2.8-3.9 5.2-3.9s4.3 1.3 5.2 3.9" /></>)}アカウント設定</Link>
          <Link href="/user/favorite" role="menuitem">{icon(<path d="M3 3.5h10v10l-5-3-5 3v-10Z" strokeLinejoin="round" />)}マイリスト</Link>
          <Link href="/user/history" role="menuitem">{icon(<><circle cx="8" cy="8" r="5.8" /><path d="M8 4.8V8l2.3 1.6" strokeLinecap="round" /></>)}視聴履歴</Link>
          <div className="hd-menu-row" role="menuitem">
            <span>表示テーマ</span>
            <ThemeToggleSwitch />
          </div>
          <button className="out hd-menu-button" type="button" role="menuitem" onClick={() => setConfirmOpen(true)}>
            {icon(<path d="M6.5 2.5H3.8a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.7M10 5l3 3-3 3M13 8H6.5" strokeLinecap="round" strokeLinejoin="round" />)}
            ログアウト
          </button>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="ログアウトしますか？"
        confirmText="ログアウト"
        cancelText="キャンセル"
      />
    </div>
  );
}
