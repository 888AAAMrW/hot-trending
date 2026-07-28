import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "实时热搜聚合 — 知乎·B站·微博",
  description: "一站式追踪中文互联网实时热搜",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
