import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatAssistant } from "@/components/ChatAssistant";

export const metadata: Metadata = {
  title: "楼观台碑刻 · 数字典藏",
  description: "纸上碑林 · 数字楼观——楼观台碑刻数字化检索与智能导览平台，提供碑文全文检索、碑石图像与影像资料浏览。",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper-100 text-ink-800">
        <SiteHeader />
        <main className="mx-auto min-h-[70vh] w-full max-w-shell px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </main>
        <SiteFooter />
        <ChatAssistant />
      </body>
    </html>
  );
}
