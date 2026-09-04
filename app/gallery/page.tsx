import type { Metadata } from "next";
import Link from "next/link";
import pdfIndex from "@/data/pdf_index.json";
import { imagePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "碑石图库 - 楼观台碑刻 · 数字典藏",
  description: "《楼观台道教碑石》扫描图库，逐页浏览全部碑石图像。",
};

interface PdfPage {
  page: number;
  orientation: string;
  width: number;
  height: number;
  imagePath: string;
  description: string;
  needsReview: boolean;
  reviewIssues: string[];
}

export default function GalleryPage() {
  const pages = pdfIndex as PdfPage[];

  return (
    <div className="mx-auto max-w-shell space-y-8">
      <nav className="text-sm text-ink-400">
        <Link href="/" className="transition-colors hover:text-cinnabar-dark">
          碑刻总览
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-600">碑石图库</span>
      </nav>

      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-ink-900">
          碑石图库
        </h1>
        <p className="mt-3 text-ink-600">
          《楼观台道教碑石》扫描图共 {pages.length} 页，逐页浏览。碑名与页码的对应关系待人工核对。
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <a
            key={p.page}
            href={imagePath(p.imagePath)}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-md border border-ink-200 bg-paper-light transition-all duration-200 hover:border-cinnabar/50 hover:shadow-soft"
          >
            <div className="overflow-hidden bg-paper-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePath(p.imagePath)}
                alt={`第 ${p.page} 页`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="px-3 py-2.5 text-sm text-ink-500">第 {p.page} 页 · {p.orientation}版</div>
          </a>
        ))}
      </div>
    </div>
  );
}
