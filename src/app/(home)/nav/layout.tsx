import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "星际导航",
};

export default function NavLayout({ children }: { children: React.ReactNode }) {
  return children;
}
