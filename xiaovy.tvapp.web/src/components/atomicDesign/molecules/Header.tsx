'use client'

import { useEffect, useState, useContext } from 'react'
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import { ThemeToggleSwitch } from "@/app/themeToggleSwitch";
import { usePathname } from 'next/navigation';
import { GroupedDBVideoList } from '@/components/GroupedDBVideoList';
import { ConfirmationModal } from '@/components/atomicDesign/molecules/ConfirmationModal';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRoleBadge } from '@/components/UserRoleBadge';
import { ProfileServiceContext } from '@/contexts/ProfileContext';
import { ProfileAvatar } from '@/components/atomicDesign/atoms/ProfileAvatar';
import { UserProfile } from '@/types/User';
import { useFavorites } from '@/hooks/useFavorites';
import { useFavoritesData } from '@/contexts/FavoritesDataContext';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useWatchHistoryData } from '@/contexts/WatchHistoryDataContext';
import { WatchHistoryResponse } from '@/types/WatchHistory';

const defaultContents = [
  { seriesTitle: 'カズレーザーと学ぶ。', seriesId: 'srcmcqwlmq', icon: PlayCircleIcon },
  { seriesTitle: 'ホンマでっか！？TV', seriesId: 'srbcuxhq2k', icon: PlayCircleIcon },
  { seriesTitle: 'ダブルチート', seriesId: 'srv3fw5nhv', icon: PlayCircleIcon },
  { seriesTitle: 'マツコ＆有吉 かりそめ天国', seriesId: 'srk5glyzmh', icon: PlayCircleIcon },
  { seriesTitle: '踊る！さんま御殿!!', seriesId: 'sr6elshzoq', icon: PlayCircleIcon },
  { seriesTitle: '酒のツマミになる話', seriesId: 'srvqbemjx1', icon: PlayCircleIcon },
  { seriesTitle: '水曜日のダウンタウン', seriesId: 'srf5mcrw4o', icon: PlayCircleIcon },
  { seriesTitle: 'モニタリング', seriesId: 'srlbnqk9nv', icon: PlayCircleIcon },
  { seriesTitle: 'マツコの知らない世界', seriesId: 'srlblerhue', icon: PlayCircleIcon },
  { seriesTitle: '住人十色～家の数だけある 家族のカタチ～', seriesId: 'srxbqmdpvs', icon: PlayCircleIcon },
  { seriesTitle: '名探偵コナン', seriesId: 'srtxft431v', icon: PlayCircleIcon },
  { seriesTitle: 'ちいかわ', seriesId: 'sr3lsg7nv7', icon: PlayCircleIcon },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const profileService = useContext(ProfileServiceContext);
  const { fetchFavorites, loading: favoritesLoading } = useFavorites();
  const { favorites: sharedFavorites, setFavorites: setSharedFavorites } = useFavoritesData();
  const { fetchHistories: fetchWatchHistory, loading: watchHistoryLoading } = useWatchHistory();
  const { histories: sharedHistories, setHistories: setSharedHistories } = useWatchHistoryData();
  const { user, clearAllAuthState } = useFirebaseAuth();

  useEffect(() => {
    if (user && !user.isAnonymous) {
      fetchFavorites();
      fetchWatchHistory();
    }
  }, [user, fetchFavorites, fetchWatchHistory]);

  // fetchFavoritesから取得したお気に入りを共有Contextに同期
  useEffect(() => {
    if (user && !user.isAnonymous) {
      (async () => {
        try {
          const response = await fetch('/api/User/favorites', {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setSharedFavorites(data.favorites || []);
          }
        } catch (error) {
          console.error('Failed to fetch favorites:', error);
        }
      })();
    }
  }, [user, setSharedFavorites]);

  // 視聴履歴を共有Contextに同期
  useEffect(() => {
    if (user && !user.isAnonymous) {
      (async () => {
        try {
          const response = await fetch('/api/User/watch-history?limit=20&offset=0', {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setSharedHistories(data.histories || []);
          }
        } catch (error) {
          console.error('Failed to fetch watch history:', error);
        }
      })();
    }
  }, [user, setSharedHistories]);

  const { role } = useUserRole();

  // プロフィール情報取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !user.isAnonymous && profileService) {
        try {
          const profileData = await profileService.getProfile();
          setProfile(profileData);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user, profileService]);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await clearAllAuthState();
      setMobileMenuOpen(false); // サイドバーを閉じる
      toast.success('ログアウトしました');
      router.push('/user/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  // useAuth内のRouter処理で、ログインページへのリダイレクトが矯正されてしまう
  // そのため、Headerではアカウント確認を行わない(暫定対応)
  // TODO // パスをカスタマイズした際にバグになるため、修正が必要
  if (pathname === '/user/login' || pathname === '/user/register') {
    return null;
  }

  return (
    <>
    <header className="bg-white dark:bg-black sticky top-0 z-10">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between pt-2 pb-2 pl-6 pr-6 lg:px-8">
        <div className="flex flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 24"
              fill="currentColor"
              className="h-8 w-auto fill-sky-400"
            >
              <path d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"></path>
            </svg>
          </a>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* ここからサイドバー */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-800 px-6 py-6 md:max-w-sm md:ring-1 md:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 24"
              fill="currentColor"
              className="h-8 w-auto fill-sky-400"
            >
              <path d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"></path>
            </svg>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">

              {/* ========== ユーザー管理セクション（上部） ========== */}
              <div className="py-6">
                {/* 1. ユーザープロフィール */}
                {profile && (
                  <a
                    href="/user/profile"
                    className="flex items-center gap-x-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ProfileAvatar
                      photoURL={profile.photoURL}
                      userName={profile.userName}
                      size="md"
                    />
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {profile.nickname}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{profile.userName}
                      </p>
                    </div>
                  </a>
                )}

                {/* 2. ユーザーロール */}
                {role !== null && (
                  <div className="mt-4 px-3">
                    <UserRoleBadge role={role} />
                  </div>
                )}

                {/* メール認証状況（未認証の場合のみ表示） */}
                {user && !user.isAnonymous && !user.emailVerified && (
                  <a
                    href="/user/verify-email"
                    className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    メールアドレスを確認
                  </a>
                )}
              </div>

              {/* ========== コンテンツセクション（中部） ========== */}
              <div className="space-y-2 py-6">

                {/* 3. サンプルリスト*/}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                  サンプルリスト
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {defaultContents.map((item) => (
                      <DisclosureButton
                        key={item.seriesTitle}
                        as="a"
                        href={`/series/${item.seriesId}`}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {item.seriesTitle}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                {/* ここまで サンプルリスト*/}

                {/* ここから お気に入りリスト*/}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton
                    onClick={() => {
                      if (user?.isAnonymous) {
                        toast.error('この機能はゲストユーザーは使用できません');
                      }
                    }}
                    className={`group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 ${
                      user?.isAnonymous
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={user?.isAnonymous}
                  >
                    お気に入りリスト
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  {!user?.isAnonymous && (
                    <DisclosurePanel className="mt-2 space-y-2">
                      {favoritesLoading ? (
                        <div className="text-sm text-gray-500 px-3 py-2">読み込み中...</div>
                      ) : sharedFavorites.length > 0 ? (
                        <>
                          {sharedFavorites.map((item) => (
                            <DisclosureButton
                              key={item.seriesId}
                              as="a"
                              href={`/series/${item.seriesId}`}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {item.seriesTitle}
                            </DisclosureButton>
                          ))}
                          <a
                            href="/user/favorite"
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            すべてのお気に入りを見る
                          </a>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                          お気に入りはまだありません
                        </div>
                      )}
                    </DisclosurePanel>
                  )}
                </Disclosure>
                {/* ここまで お気に入りリスト*/}

                {/* ここから 視聴履歴*/}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton
                    onClick={() => {
                      if (user?.isAnonymous) {
                        toast.error('この機能はゲストユーザーは使用できません');
                      }
                    }}
                    className={`group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 ${
                      user?.isAnonymous
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={user?.isAnonymous}
                  >
                    視聴履歴
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  {!user?.isAnonymous && (
                    <DisclosurePanel className="mt-2 space-y-2">
                      {watchHistoryLoading ? (
                        <div className="text-sm text-gray-500 px-3 py-2">読み込み中...</div>
                      ) : sharedHistories.length > 0 ? (
                        <>
                          {sharedHistories.map((item: WatchHistoryResponse) => (
                            <DisclosureButton
                              key={item.id}
                              as="a"
                              href={`/episode/${item.episodeId}`}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {item.episodeTitle}
                            </DisclosureButton>
                          ))}
                          <a
                            href="/user/history"
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            すべての視聴履歴を見る
                          </a>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                          視聴履歴はまだありません
                        </div>
                      )}
                    </DisclosurePanel>
                  )}
                </Disclosure>
                {/* ここまで 視聴履歴*/}

                {/* ここから DBリスト*/}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                    DBリスト
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    <div className="max-h-96 overflow-y-auto">
                      <GroupedDBVideoList />
                    </div>
                  </DisclosurePanel>
                </Disclosure>
                {/* ここまで DBリスト*/}
              </div>

              {/* ========== 設定セクション（下部） ========== */}
              <div className="py-6">

                {/* 6. ユーザー管理（特権ユーザーのみ） */}
                {role === 99 && (
                  <a
                    href="/admin/users"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ユーザー管理
                  </a>
                )}

                {/* 7. ダークモード */}
                <div className="flex items-center justify-between -mx-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                    ダークモード
                  </span>
                  <ThemeToggleSwitch />
                </div>

                {/* 8. ログアウト */}
                <button
                  onClick={handleLogoutClick}
                  className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="ログアウトしますか？"
        confirmText="はい"
        cancelText="いいえ"
      />
    </header>
    </>
  )
}