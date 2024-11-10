'use client'

import { useEffect, useState } from 'react'
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
import { ThemeSelector } from "@/app/themeSelector";
import { ThemeToggleSwitch } from "@/app/themeToggleSwitch";
import { usePathname } from 'next/navigation';
import { readFavoriteSeries } from '@/utils/Util/favoriteSeries';
import { seriesInfo } from '@/types/utils/favoriteSeries';

const callsToAction = [
  { seriesTitle: 'カズレーザーと学ぶ。', seriesId: 'srv3fw5nhv', icon: PlayCircleIcon },
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

  useEffect(() => {
    try {
      const favContents:seriesInfo[] = readFavoriteSeries();
      if (favContents) setFavoriteSeries(favContents);
      console.log(favContents);
      console.log(favoriteSeries);
    } catch (error) {
      console.error("Failed to read favorite series:", error);
    }

    // const convertFavoriteSeries = (favContents:seriesInfo[]) => {
      
    // }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('IdToken');
    window.location.href = '/user/login';
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
            <img
            alt="ロゴデータ"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="h-8 w-auto"
            />
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
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              Product
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
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50 dark:bg-gray-700">
                {callsToAction.map((item) => (
                  <a
                    key={item.seriesTitle}
                    href={`/series/${item.seriesId}`}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <item.icon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400 dark:text-gray-300" />
                    {item.seriesTitle}
                  </a>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Features
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Marketplace
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Company
          </a>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <ThemeSelector />
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a href="/user/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
        {/* ここまでPC表示 大のヘッダー */}
      </nav>

      {/* ここからサイドバー */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
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
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Product
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...favoriteSeries, ...callsToAction].map((item) => (
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
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Company
                </a>
                <div
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ダークモード <ThemeToggleSwitch />
                </div>
              </div>
              
              <div className="py-6">
                <a
                  href="/user/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Log in
                </a>
                <button
                  onClick={handleLogout}
                  className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Log out
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