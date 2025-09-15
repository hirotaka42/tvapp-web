'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import { ThemeToggleSwitch } from "@/app/themeToggleSwitch";
import { usePathname } from 'next/navigation';
import { readFavoriteSeries } from '@/utils/Util/favoriteSeries';
import { seriesInfo } from '@/types/utils/favoriteSeries';
import { DBVideoList } from '@/components/DBVideoList';

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
  const pathname = usePathname();
  const [favoriteSeries, setFavoriteSeries] = useState<seriesInfo[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const favContents:seriesInfo[] = readFavoriteSeries();
      if (favContents) setFavoriteSeries(favContents);
      console.log(favContents);
      console.log(favoriteSeries);
    } catch (error) {
      console.error("Failed to read favorite series:", error);
    }
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('IdToken');
    toast.success('ログアウトしました');
    router.push('/user/login');
  }

  const handleComigSoon = () => {
    toast('現在開発中です');
  }
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
        <div className="flex lg:flex-1">
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
        {/* ここからPC表示 小のヘッダー lg:hidden */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        {/* ここまでPC表示 小のヘッダー */}
        {/* ここからPC表示 大のヘッダー hidden lg:flex */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">

          {/* ここから サンプルリスト*/}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              サンプル
              <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50 dark:bg-gray-700">
                {defaultContents.map((item) => (
                  <a
                    key={item.seriesTitle}
                    href={`/series/${item.seriesId}`}
                    className="flex items-center justify-start gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <item.icon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400 dark:text-gray-300" />
                    {item.seriesTitle}
                  </a>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
          {/* ここまで サンプルリスト*/}

          {/* ここから お気に入りリスト*/}
          <Popover className="relative">
          <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              お気に入りリスト
              <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {favoriteSeries.map((item) => (
                  <div
                    key={item.seriesId}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex-auto">
                      <a href={`/series/${item.seriesId}`} className="block font-semibold text-gray-900 dark:text-gray-100">
                        {item.seriesTitle}
                        <span className="absolute inset-0" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>  
          </Popover>
          {/* ここまで お気に入りリスト*/}

          {/* ここから DBリスト*/}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              DBリスト
              <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="max-h-96 overflow-y-auto">
                <div className="p-2 text-xs text-gray-500 border-b">デバッグ: DBVideoList (デスクトップ)</div>
                <DBVideoList maxItems={15} />
              </div>
            </PopoverPanel>
          </Popover>
          {/* ここまで DBリスト*/}

          {/* ここから 50件ランキング*/}
          <a href="#" onClick={handleComigSoon} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            ジャンル別ランキング
          </a>
          {/* ここまで 50件ランキング*/}

          <a href="/stream" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            JP_M3U Player (Test)
          </a>
        </PopoverGroup>

        {/* ユーザー管理機能 */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a onClick={handleLogout} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            ログアウト
          </a>
        </div>
        {/* ユーザー管理機能ここまで */}
        {/* ここまでPC表示 大のヘッダー */}
      </nav>

      {/* ここからサイドバー */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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
              <div className="space-y-2 py-6">

                {/* ここから サンプルリスト*/}
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
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                    お気に入りリスト
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {favoriteSeries.map((item) => (
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
                {/* ここまで お気に入りリスト*/}

                {/* ここから DBリスト*/}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                    DBリスト
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2 text-xs text-gray-500 border-b">デバッグ: DBVideoList (モバイル)</div>
                      <DBVideoList maxItems={15} />
                    </div>
                  </DisclosurePanel>
                </Disclosure>
                {/* ここまで DBリスト*/}
                <a
                  href="#"
                  onClick={handleComigSoon}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ジャンル別ランキング(coming soon...)
                </a>
                <a
                  href="/stream"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  JP_M3U Player (Test)
                </a>
                <div
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ダークモード <ThemeToggleSwitch />
                </div>
              </div>
              
              <div className="py-6">
                <button
                  onClick={handleComigSoon}
                  className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  My アカウント(coming soon...)
                </button>
                <button
                  onClick={handleComigSoon}
                  className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  バックアップ(coming soon...)
                </button>
                <button
                  onClick={handleLogout}
                  className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
    </>
  )
}