import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameHot — 游戏行业每日热点",
  description: "精选游戏行业每日热点，涵盖新游资讯、设计拆解、行业动态",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
