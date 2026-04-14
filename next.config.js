/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 核心：彻底跳过TypeScript和ESLint构建校验
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: ["@prisma/client", "redis"],
  },
  webpack: (config, { isServer }) => {
    // 服务器端配置
    if (isServer) {
      config.externals.push("@prisma/client");
    }

    // 优化图片加载
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|webp)$/i,
      use: [
        {
          loader: "image-webpack-loader",
          options: {
            bypassOnDebug: true,
            mozjpeg: {
              progressive: true,
              quality: 65,
            },
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: [0.65, 0.9],
              speed: 4,
            },
            gifsicle: {
              interlaced: false,
            },
            webp: {
              quality: 75,
            },
          },
        },
      ],
    });

    return config;
  },
  images: {
    domains: ["picsum.photos", "placehold.co", "images.unsplash.com"],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  trailingSlash: true,
  basePath: "",
};

module.exports = nextConfig;