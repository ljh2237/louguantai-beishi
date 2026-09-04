import type { Metadata } from "next";
import Link from "next/link";
import { getAllTablets } from "@/lib/tablets";
import { VideoCard } from "@/components/VideoCard";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "碑刻影像 - 楼观台碑刻 · 数字典藏",
  description: "楼观台碑刻影像资料总览，收录相关碑刻的影像资料。",
};

export default function VideosPage() {
  const tablets = getAllTablets();
  const withVideo = tablets.filter((t) => t.video);

  return (
    <div className="mx-auto max-w-shell space-y-8">
      <nav className="text-sm text-ink-400">
        <Link href="/" className="transition-colors hover:text-cinnabar-dark">
          碑刻总览
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-600">碑刻影像</span>
      </nav>

      <SectionHeading
        title="碑刻影像"
        subtitle={`共收录 ${withVideo.length} 条碑刻影像资料，点击前往详情页观看`}
      />

      {withVideo.length === 0 ? (
        <div className="rounded-md border border-ink-200 bg-paper-light py-20 text-center text-ink-400">
          暂无影像资料。
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {withVideo.map((t) => (
            <VideoCard key={t.id} tablet={t} />
          ))}
        </div>
      )}
    </div>
  );
}
