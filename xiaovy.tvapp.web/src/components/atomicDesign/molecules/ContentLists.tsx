import Image from 'next/image';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface ExampleProps {
  contents: ConvertedContent[];
}

const Example: React.FC<ExampleProps> = ({ contents }) => {
  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          ドラマランキング
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {contents.map((content) => (
            <a
              key={content.id}
              href="#"
              className="flex flex-row sm:flex-col items-center rounded-lg shadow hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 bg-white"
            >
              <div className="w-1/3 sm:w-full flex-shrink-0">
                <Image
                  alt={content.title}
                  src={content.thumbnail.small}
                  width={480}
                  height={270}
                  className="object-cover w-full h-18 rounded-t-lg sm:rounded-none sm:rounded-t-lg"
                />
              </div>
              <div className="p-4 leading-normal w-2/3 sm:w-full">
                <h5
                  className="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white truncate"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {content.title}
                </h5>
                <p
                  className="mb-1 font-normal text-gray-700 dark:text-gray-400 truncate"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {content.broadcastDateLabel}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {content.rank}位
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Example;