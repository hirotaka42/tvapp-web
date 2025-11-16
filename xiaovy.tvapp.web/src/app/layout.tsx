import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import Header from '@/components/atomicDesign/molecules/Header';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen dark:bg-black dark:text-white`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
