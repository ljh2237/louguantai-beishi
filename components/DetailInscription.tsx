"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Tablet } from "@/types/tablet";
import { Highlight } from "@/components/Highlight";

// 碑文区块标签（碑阳/碑阴/其他部分）
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 inline-block rounded-sm border border-bronze/40 px-2.5 py-0.5 text-sm tracking-[0.2em] text-bronze">
      {children}
    </h3>
  );
}

function InscriptionBody({ tablet, query }: { tablet: Tablet; query: string }) {
  const ins = tablet.inscription;
  const hasFront = !!ins.front;
  const hasBack = !!ins.back;

  if (hasFront || hasBack) {
    return (
      <div className="space-y-8">
        {hasFront && (
          <div>
            <SectionLabel>碑阳</SectionLabel>
            <div className="prose-inscription">
              <Highlight text={ins.front as string} query={query} />
            </div>
          </div>
        )}
        {hasBack && (
          <div>
            <SectionLabel>碑阴</SectionLabel>
            <div className="prose-inscription">
              <Highlight text={ins.back as string} query={query} />
            </div>
          </div>
        )}
        {ins.otherSections.map((s, i) => (
          <div key={i}>
            <SectionLabel>其他部分 {i + 1}</SectionLabel>
            <div className="prose-inscription">
              <Highlight text={s} query={query} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>碑文原文</SectionLabel>
      <div className="prose-inscription">
        <Highlight text={ins.fullText} query={query} />
      </div>
    </div>
  );
}

export function DetailInscription({ tablet }: { tablet: Tablet }) {
  return (
    <Suspense fallback={<p className="text-ink-400">加载中……</p>}>
      <InscriptionWithQuery tablet={tablet} />
    </Suspense>
  );
}

function InscriptionWithQuery({ tablet }: { tablet: Tablet }) {
  const params = useSearchParams();
  const query = params?.get("q") || "";
  return <InscriptionBody tablet={tablet} query={query} />;
}
