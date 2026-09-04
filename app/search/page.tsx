import type { Metadata } from "next";
import { getAllTablets, getDynasties } from "@/lib/tablets";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "全文检索 - 楼观台碑刻 · 数字典藏",
  description: "在石刻文字中寻找历史的踪迹——检索楼观台碑刻的碑名、碑文、人物、地点与朝代。",
};

export default function SearchPage() {
  const tablets = getAllTablets();
  const dynasties = getDynasties();

  return <SearchClient tablets={tablets} dynasties={dynasties} />;
}
