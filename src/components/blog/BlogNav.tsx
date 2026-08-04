"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/blog", label: "文章", alpha: 0.10 },
  { href: "/blog/tags", label: "标签", alpha: 0.18 },
  { href: "/blog/about", label: "关于", alpha: 0.26 },
];

export default function BlogNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3">
      {links.map(({ href, label, alpha }) => {
        const isActive =
          pathname === href ||
          (href !== "/blog" && pathname.startsWith(href));

        const bgAlpha = isActive ? alpha + 0.1 : alpha;

        return (
          <Link
            key={href}
            href={href}
            className={`text-[11px] px-4 py-1.5 rounded-full tracking-[0.1em] transition-all duration-200
              ${isActive
                ? "text-white/90"
                : "text-white/60 hover:text-white/85"
              }`}
            style={{
              background: `rgba(20,25,50,${bgAlpha})`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: isActive
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(255,255,255,0.06)",
              boxShadow: isActive
                ? "0 0 12px rgba(150,225,245,0.1)"
                : "none",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
