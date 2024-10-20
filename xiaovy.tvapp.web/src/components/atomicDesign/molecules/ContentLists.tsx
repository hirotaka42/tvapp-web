import Image from 'next/image';
import { ConvertedContent } from '@/types/CardItem/RankingContent';

interface ExampleProps {
  contents: ConvertedContent[];
}

const Example: React.FC<ExampleProps> = ({ contents }) => {
  return (
    <div 
      className="min-h-screen dark:bg-black dark:text-white"
    >
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ドラマランキング</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {contents.map((content) => (
            <div key={content.id} className="group relative">
              <div className="aspect-h-9 aspect-w-16 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75">
                <Image
                  alt={content.title}
                  src={content.thumbnail.small}
                  width={250}
                  height={140}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 dark:text-gray-300">
                    <a href="#">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {content.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{content.broadcastDateLabel}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{content.rank}位</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Example;