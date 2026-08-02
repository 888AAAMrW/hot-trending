"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/blog", label: "文章" },
  { href: "/blog/tags", label: "标签" },
  { href: "/blog/about", label: "关于" },
];

export default function BlogNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8">
      {links.map(({ href, label }) => {
        // 精确匹配 或 子路径匹配（如 /blog/tags/xxx 属于标签）
        const isActive =
          pathname === href ||
          (href !== "/blog" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={`relative text-xs tracking-[0.12em] py-1 transition-colors group ${
              isActive
                ? "text-amber-300/80"
                : "text-white/60 hover:text-amber-300/80"
            }`}
          >
            {label}
            {/* 底部金线：hover 出现 or 当前页常驻 */}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-amber-400/50 transition-all duration-300 ${
                isActive ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
