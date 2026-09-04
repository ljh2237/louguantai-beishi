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

// 朝代按历史时序排列（未收录的朝代回退到拼音排序，置后）
const DYNASTY_ORDER = ["隋", "唐", "宋", "元", "明", "清"];

export function sortDynasties(dynasties: string[]): string[] {
  return [...dynasties].sort((a, b) => {
    const ia = DYNASTY_ORDER.indexOf(a);
    const ib = DYNASTY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "zh");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

// 从实际数据动态推导朝代列表（不硬编码）
export function getDynasties(): string[] {
  const set = new Set<string>();
  for (const t of tablets) {
    if (t.dynasty) set.add(t.dynasty);
  }
  return sortDynasties(Array.from(set));
}

export interface ArchiveStats {
  total: number;
  withImage: number;
  withVideo: number;
  withReview: number;
  dynasties: string[];
  dynastyCounts: Record<string, number>;
}

export function getStats(): ArchiveStats {
  const withImage = tablets.filter((t) => t.images.length > 0).length;
  const withVideo = tablets.filter((t) => t.video).length;
  const withReview = tablets.filter((t) => t.needsReview).length;
  const dynastyCounts: Record<string, number> = {};
  for (const t of tablets) {
    if (t.dynasty) dynastyCounts[t.dynasty] = (dynastyCounts[t.dynasty] || 0) + 1;
  }
  return {
    total: tablets.length,
    withImage,
    withVideo,
    withReview,
    dynasties: getDynasties(),
    dynastyCounts,
  };
}
