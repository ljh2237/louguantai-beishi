"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Tablet } from "@/types/tablet";
import { Highlight } from "@/components/Highlight";

function InscriptionBody({ tablet, query }: { tablet: Tablet; query: string }) {
  const ins = tablet.inscription;
  const hasFront = !!ins.front;
  const hasBack = !!ins.back;

  if (hasFront || hasBack) {
    return (
      <div className="space-y-6">
        {hasFront && (
          <div>
            <h3 className="mb-2 font-serif text-lg text-ink-800">碑阳</h3>
            <div className="prose-inscription">
              <Highlight text={ins.front as string} query={query} />
            </div>
          </div>
        )}
        {hasBack && (
          <div>
            <h3 className="mb-2 font-serif text-lg text-ink-800">碑阴</h3>
            <div className="prose-inscription">
              <Highlight text={ins.back as string} query={query} />
            </div>
          </div>
        )}
        {ins.otherSections.map((s, i) => (
          <div key={i}>
            <h3 className="mb-2 font-serif text-lg text-ink-800">其他部分 {i + 1}</h3>
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
      <h3 className="mb-2 font-serif text-lg text-ink-800">碑文原文</h3>
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
