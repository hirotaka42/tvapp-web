import Image from 'next/image';
import React from 'react';

export const BrandPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-600 p-12 items-center justify-center">
      <div className="max-w-md text-white">
        <div className="mb-8">
          <Image
            src="/brand/tvapp-wordmark-light.png"
            alt="TVapp"
            width={220}
            height={80}
            className="mb-6 h-auto w-56"
            unoptimized
          />
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            TVApp Web
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            あなたのお気に入りの番組を、<br />いつでもどこでも
          </p>
        </div>

        <div className="space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-lg">豊富なコンテンツライブラリ</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-lg">高画質ストリーミング</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-lg">マルチデバイス対応</span>
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-auto opacity-20">
          <svg
            viewBox="0 0 400 300"
            className="w-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* TV Screen */}
            <rect x="50" y="50" width="300" height="200" rx="10" />
            <rect x="60" y="60" width="280" height="160" rx="5" />
            {/* Play button */}
            <circle cx="200" cy="140" r="30" />
            <path d="M190 125 L220 140 L190 155 Z" fill="currentColor" />
            {/* TV Stand */}
            <line x1="150" y1="250" x2="250" y2="250" strokeWidth="3" />
            <line x1="200" y1="250" x2="200" y2="280" strokeWidth="3" />
            <line x1="170" y1="280" x2="230" y2="280" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
