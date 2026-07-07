import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// ローカル `next dev` で Cloudflare のバインディング(env/KV等)を利用可能にする。
if (process.env.NODE_ENV === 'development') {
    initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tailwindui.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'statics.tver.jp',
                pathname: '/**',
            },
        ],
    },
    reactStrictMode: true, // falseにすると2重動作が無効になる
};

export default nextConfig;
