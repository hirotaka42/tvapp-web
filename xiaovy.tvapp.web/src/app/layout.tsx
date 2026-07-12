import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { AppHeader } from '@/components/atomicDesign/organisms/AppHeader';
import "./globals.css";

export const metadata: Metadata = {
  title: "TVapp",
  description: "あなたの好きなをもっと手軽に。日本最大級のストリーミングサービスをもっと便利に。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="ja">
      <body
        className="antialiased min-h-screen dark:bg-black dark:text-white"
      >
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
