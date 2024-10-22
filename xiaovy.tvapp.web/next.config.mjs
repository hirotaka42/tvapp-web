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
    reactStrictMode: true,
};

export default nextConfig;