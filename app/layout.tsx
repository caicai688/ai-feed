import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 信息聚合 - 实时追踪 AI 领域动态",
  description: "聚合 Anthropic、OpenAI、MIT Tech Review 等顶级 AI 信源的最新资讯",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
