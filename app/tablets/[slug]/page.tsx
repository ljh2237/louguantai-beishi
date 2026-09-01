import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTablets, getTabletBySlug } from "@/lib/tablets";
import { ImageViewer } from "@/components/ImageViewer";
import { DetailInscription } from "@/components/DetailInscription";

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

  const metaRows: { label: string; value: string }[] = [];
  if (tablet.alternativeTitles.length > 0)
    metaRows.push({ label: "别名", value: tablet.alternativeTitles.join("、") });
  if (tablet.dynasty) metaRows.push({ label: "朝代", value: tablet.dynasty });
  if (tablet.dateText) metaRows.push({ label: "年代", value: tablet.dateText });
  if (tablet.location) metaRows.push({ label: "地点", value: tablet.location });
  if (tablet.author) metaRows.push({ label: "撰文", value: tablet.author });
  if (tablet.calligrapher) metaRows.push({ label: "书写", value: tablet.calligrapher });
  if (tablet.engraver) metaRows.push({ label: "篆刻", value: tablet.engraver });
  if (tablet.otherPeople.length > 0)
    metaRows.push({ label: "其他人物", value: tablet.otherPeople.join("、") });

  const sourceText = [
    tablet.source.textFile,
    tablet.source.pdfFile,
    tablet.source.pdfPages.length ? `PDF 第 ${tablet.source.pdfPages.join("、")} 页` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <nav className="text-sm text-ink-400">
          <Link href="/" className="hover:text-ink-600">
            首页
          </Link>
          <span className="mx-1">/</span>
          <span className="text-ink-600">{tablet.title}</span>
        </nav>
        <Link href="/" className="text-sm text-gold-600 hover:underline">
          ← 返回列表
        </Link>
      </div>

      <header className="border-b border-ink-200 pb-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-3xl text-ink-900">{tablet.title}</h1>
          {tablet.dynasty && (
            <span className="rounded bg-gold-400/30 px-2 py-1 text-sm text-ink-600">{tablet.dynasty}</span>
          )}
          {tablet.category !== "main" && (
            <span className="rounded bg-ink-100 px-2 py-1 text-xs text-ink-400">
              {tablet.category}
            </span>
          )}
        </div>

        {metaRows.length > 0 && (
          <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {metaRows.map((r) => (
              <div key={r.label} className="flex gap-2 text-sm">
                <dt className="shrink-0 text-ink-400">{r.label}：</dt>
                <dd className="text-ink-700">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {tablet.needsReview && (
        <div className="rounded-md bg-gold-400/10 px-4 py-3 text-sm text-ink-600">
          <b>待人工复核：</b>
          {tablet.reviewIssues.join("；")}
        </div>
      )}

      {tablet.introduction && (
        <section>
          <h2 className="mb-2 font-serif text-xl text-ink-800">简介</h2>
          <p className="leading-relaxed text-ink-700">{tablet.introduction}</p>
        </section>
      )}

      {tablet.images.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl text-ink-800">碑刻图片</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageViewer images={tablet.images} />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-xl text-ink-800">碑文</h2>
        <DetailInscription tablet={tablet} />
      </section>

      <section className="border-t border-ink-200 pt-4 text-sm text-ink-400">
        <p>资料来源：{sourceText || "文本.docx"}</p>
        <p className="mt-1">
          说明：本页内容为自动化整理结果，朝代、年代、撰文等字段可能需人工核对。
        </p>
      </section>
    </div>
  );
}
