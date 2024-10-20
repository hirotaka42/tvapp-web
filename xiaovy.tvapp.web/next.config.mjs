/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['tailwindui.com'],
    },
    reactStrictMode: true, // StrictModeを一時的に無効(false)にする
};

export default nextConfig;
