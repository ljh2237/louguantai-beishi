// 统一路径辅助：兼容 GitHub Pages 的 basePath 子路径。
// 本地开发时 NEXT_PUBLIC_BASE_PATH 为空，GitHub Pages 构建时为 /louguantai-beishi。
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function getBasePath(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return `${BASE_PATH}${path}`;
}

export function imagePath(path: string): string {
  return getBasePath(path);
}
