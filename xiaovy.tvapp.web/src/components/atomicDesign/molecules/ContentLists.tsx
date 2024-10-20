import Image from 'next/image'

// // 入力予想
// { "label": "ドラマランキング",
//   "contents": [
//       {
//           "type": "episode",
//           "content": {
//               "id": "epzjmzse1d",
//               "version": 9,
//               "title": "第1話 保健室にはなるべく来ないでもらいたい",
//               "seriesID": "srbzu3axsx",
//               "endAt": 1735387140,
//               "broadcastDateLabel": "10月12日(土)放送分",
//               "isNHKContent": false,
//               "isSubtitle": true,
//               "ribbonID": 0,
//               "seriesTitle": "放課後カルテ",
//               "isAvailable": true,
//               "broadcasterName": "日テレ",
//               "productionProviderName": "日テレ"
//           },
//           "rank": 1
//       },

// // 最低限必要な形式にコンバートする
// { 
//   "label": "ドラマランキング",
//   "contents": [
//       { 
//         content: {
//           id: "epzjmzse1d",
//           title: '第1話 保健室にはなるべく来ないでもらいたい',
//           seriesID: "srbzu3axsx",
//           endAt: 1735387140,
//           seriesTitle: '放課後カルテ',
//           broadcasterName: '日テレ',
//           productionProviderName: '日テレ',
//           broadcastDateLabel: '10月12日(土)放送分',
//           rank: 1,
//         },
//       },
//       // More products...
//   ]
// }

// const contents = [
//   {
//     id: "epzjmzse1d",
//     title: '第1話 保健室にはなるべく来ないでもらいたい',
//     seriesID: "srbzu3axsx",
//     endAt: 1735387140,
//     seriesTitle: '放課後カルテ',
//     broadcasterName: '日テレ',
//     productionProviderName: '日テレ',
//     broadcastDateLabel: '10月12日(土)放送分',
//     thumbnail: {
//        small: 'https://statics.tver.jp/images/content/thumbnail/episode/small/epzjmzse1d.jpg',
//        xlarge: 'https://statics.tver.jp/images/content/thumbnail/episode/xlarge/epzjmzse1d.jpg',
//     },
//     rank: 1,
//   },
//   // More products...
// ]

const products = [
  {
    id: 1,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  {
    id: 2,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-02.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  {
    id: 3,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-03.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  {
    id: 4,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-04.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  // More products...
]

export default function Example() {
  return (
    <div 
      className="min-h-screen dark:bg-black dark:text-white"
    >
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customers also purchased</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <Image
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  width={500} // 画像の幅を指定
                  height={500} // 画像の高さを指定
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 dark:text-gray-300">
                    <a href={product.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.color}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}