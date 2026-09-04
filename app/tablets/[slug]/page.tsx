import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTablets, getTabletBySlug } from "@/lib/tablets";
import { ImageViewer } from "@/components/ImageViewer";
import { BilibiliPlayer } from "@/components/BilibiliPlayer";
import { DetailInscription } from "@/components/DetailInscription";
import { TabletMeta } from "@/components/TabletMeta";

export function generateStaticParams() {
  return getAllTablets().map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tablet = getTabletBySlug(params.slug);
  if (!tablet) return { title: "碑刻详情" };
  return {
    title: `${tablet.title} - 楼观台碑刻数字平台`,
    description: tablet.introduction || tablet.title,
  };
}

export default function TabletDetailPage({ params }: { params: { slug: string } }) {
  const tablet = getTabletBySlug(params.slug);
  if (!tablet) notFound();

  return (
    <div className="mx-auto max-w-shell space-y-10 sm:space-y-12">
      {/* 面包屑 */}
      <nav className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-400">
        <div>
          <Link href="/" className="transition-colors hover:text-cinnabar-dark">
            碑刻总览
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-600">{tablet.title}</span>
        </div>
        <Link href="/" className="transition-colors hover:text-cinnabar-dark">
          ← 返回列表
        </Link>
      </nav>

      {/* 标题区 */}
      <header>
        <p className="text-sm tracking-[0.3em] text-cinnabar-dark">
          {tablet.dynasty ? `${tablet.dynasty} · 碑刻` : "碑刻"}
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-[0.08em] text-ink-900 sm:text-4xl">
            {tablet.title}
          </h1>
          {tablet.category !== "main" && (
            <span className="rounded-sm border border-ink-300 px-2 py-0.5 text-xs text-ink-500">
              {tablet.category}
            </span>
          )}
        </div>
      </header>

      {/* 元数据 */}
      <TabletMeta tablet={tablet} />

      {/* 待复核提示 */}
      {tablet.needsReview && (
        <div className="rounded-md border border-bronze/40 bg-bronze/10 px-4 py-3 text-sm text-ink-600">
          <b className="text-bronze">待人工复核：</b>
          {tablet.reviewIssues.join("；")}
        </div>
      )}

      {/* 图文区：图像约 42%，文字约 58% */}
      <section className="grid gap-8 lg:grid-cols-[42fr_58fr] lg:items-start">
        {tablet.images.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif text-lg tracking-[0.15em] text-ink-800">碑刻图像</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <ImageViewer images={tablet.images} />
            </div>
          </div>
        )}

        <div className="space-y-6">
          {tablet.introduction && (
            <div>
              <h2 className="mb-3 font-serif text-lg tracking-[0.15em] text-ink-800">简介</h2>
              <p className="text-lg leading-loose text-ink-700">{tablet.introduction}</p>
            </div>
          )}
          {tablet.alternativeTitles.length > 0 && (
            <div className="border-t border-ink-200 pt-4">
              <p className="text-sm text-ink-500">
                <span className="text-ink-400">别称：</span>
                {tablet.alternativeTitles.join("、")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 碑刻影像 */}
      {tablet.video && (
        <section id="video" className="scroll-mt-24">
          <h2 className="mb-4 font-serif text-lg tracking-[0.15em] text-ink-800">碑刻影像</h2>
          <BilibiliPlayer bvid={tablet.video.bvid} />
          <div className="mt-3 text-right">
            <a
              href={tablet.video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cinnabar-dark underline underline-offset-4 transition-colors hover:text-cinnabar"
            >
              在哔哩哔哩观看 →
            </a>
          </div>
        </section>
      )}

      {/* 碑文（视觉中心） */}
      <section>
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-[0.28em] text-ink-900">碑 文</h2>
          <div className="mt-4 h-[2px] w-10 bg-cinnabar" aria-hidden="true" />
        </div>
        <div className="mx-auto max-w-reading">
          <div className="border-t border-ink-300 pt-6">
            <DetailInscription tablet={tablet} />
          </div>
          <div className="mt-6 border-b border-ink-300" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
