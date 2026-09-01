import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatAssistant } from "@/components/ChatAssistant";

export const metadata: Metadata = {
  title: "楼观台碑刻数字平台",
  description: "楼观台碑刻数字资料检索与展示平台，提供碑文全文检索、图像浏览与资料查询。",
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
        <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8">{children}</main>
        <SiteFooter />
        <ChatAssistant />
      </body>
    </html>
  );
}
