/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 核心：彻底跳过TypeScript和ESLint构建校验
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;