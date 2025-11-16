// src/components/atomicDesign/atoms/LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8 animate-pulse" />
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {[1, 2, 3].map((section) => (
            <div key={section} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
              </div>
              <div className="px-6 py-4 space-y-4">
                {[1, 2, 3].map((field) => (
                  <div key={field} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
