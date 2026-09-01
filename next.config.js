/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // GitHub Pages 静态导出
  output: 'export',
  // 项目站点子路径（本地开发为空，GitHub Pages 为 /louguantai-beishi）
  basePath,
  // 静态导出时禁用 next/image 优化
  images: {
    unoptimized: true,
  },
  // 允许静态导出（含 trailingSlash，避免子页面刷新 404）
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
