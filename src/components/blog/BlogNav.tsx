"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { id: "hero", label: "首页" },
  { id: "posts", label: "文章" },
  { id: "projects", label: "项目" },
  { id: "guestbook", label: "留言" },
  { id: "about", label: "关于" },
];

export default function BlogNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/blog";

  const [active, setActive] = useState("hero");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef("hero");

  const updateIndicator = useCallback((id: string) => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-nav="${id}"]`);
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, []);

  // 首页：滚动监听 → 高亮当前位置
  useEffect(() => {
    if (!isHome) return;

    const ids = LINKS.map((l) => l.id);

    const onScroll = () => {
      const scrollY = window.scrollY + 140;
      let current = ids[0];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollY) {
          current = ids[i];
          break;
        }
      }
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActive(current);
        updateIndicator(current);
      }
    };

    onScroll();
    updateIndicator("hero");

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, updateIndicator]);

  // 点击：首页平滑滚，其他页面跳回首页对应位置
  const handleClick = useCallback(
    (id: string) => {
      if (isHome) {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      } else {
        router.push(`/blog#${id}`);
      }
    },
    [isHome, router]
  );

  return (
    <nav ref={navRef} className="relative flex items-center gap-1">
      {/* 滑动指示器 */}
      {isHome && (
        <div
          className="absolute top-0 bottom-0 rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicator.left,
            width: indicator.width,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 0 8px rgba(180,160,220,0.06)",
          }}
        />
      )}

      {LINKS.map(({ id, label }) => {
        const isActive = isHome && active === id;
        return (
          <button
            key={id}
            data-nav={id}
            onClick={() => handleClick(id)}
            className={`relative text-[13px] px-5 py-2 rounded-full tracking-[0.1em] transition-colors duration-200
              ${isActive ? "text-white/90" : "text-white/45 hover:text-white/70"}`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
