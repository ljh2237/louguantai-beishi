import type { Metadata } from "next";
import Link from "next/link";
import pdfIndex from "@/data/pdf_index.json";
import { imagePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "碑石图库 - 楼观台碑刻数字平台",
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
    <div className="space-y-6">
      <nav className="text-sm text-ink-400">
        <Link href="/" className="hover:text-ink-600">
          首页
        </Link>
        <span className="mx-1">/</span>
        <span className="text-ink-600">碑石图库</span>
      </nav>

      <header>
        <h1 className="font-serif text-3xl text-ink-900">碑石图库</h1>
        <p className="mt-2 text-ink-600">
          《楼观台道教碑石》扫描图共 {pages.length} 页，逐页浏览。碑名与页码的对应关系待人工核对。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <a
            key={p.page}
            href={imagePath(p.imagePath)}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-lg border border-ink-200 bg-paper-50 transition hover:border-gold-500"
          >
            <div className="overflow-hidden bg-paper-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePath(p.imagePath)}
                alt={`第 ${p.page} 页`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="px-3 py-2 text-sm text-ink-500">
              第 {p.page} 页 · {p.orientation}版
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
