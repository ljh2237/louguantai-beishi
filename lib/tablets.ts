import type { Tablet } from "@/types/tablet";
import tabletsData from "@/data/tablets.json";

// build 时直接导入结构化数据（保证静态导出，不依赖运行时读取本地文件）
export const tablets: Tablet[] = tabletsData as Tablet[];

export function getAllTablets(): Tablet[] {
  return tablets;
}

export function getTabletBySlug(slug: string): Tablet | undefined {
  return tablets.find((t) => t.slug === slug);
}

export function getTabletById(id: number): Tablet | undefined {
  return tablets.find((t) => t.id === id);
}

// 从实际数据动态推导朝代列表（不硬编码）
export function getDynasties(): string[] {
  const set = new Set<string>();
  for (const t of tablets) {
    if (t.dynasty) set.add(t.dynasty);
  }
  return Array.from(set).sort();
}

export function getStats() {
  const withImage = tablets.filter((t) => t.images.length > 0).length;
  const withReview = tablets.filter((t) => t.needsReview).length;
  return {
    total: tablets.length,
    withImage,
    withReview,
    dynasties: getDynasties(),
  };
}
