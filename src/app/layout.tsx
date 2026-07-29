import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "实时热搜聚合",
    template: "%s — Starry Nova",
  },
  description: "知乎 · B站 · 微博一站式热搜聚合",
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
