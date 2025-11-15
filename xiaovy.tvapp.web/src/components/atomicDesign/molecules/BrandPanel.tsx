import React from 'react';

export const BrandPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-600 p-12 items-center justify-center">
      <div className="max-w-md text-white">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 24"
            fill="currentColor"
            className="h-12 w-auto mb-6"
          >
            <path d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"></path>
          </svg>
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
