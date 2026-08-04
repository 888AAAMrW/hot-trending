"use client";

import { useState, useEffect } from "react";

const ITEMS = [
  {
    id: "github",
    label: "GitHub",
    tip: "开源项目",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    action: () => window.open("https://github.com/888AAAMrW", "_blank"),
  },
  {
    id: "email",
    label: "Email",
    tip: "复制邮箱",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 6l10 7 10-7" />
      </svg>
    ),
    action: () => {
      navigator.clipboard.writeText("790009027@qq.com").then(() => {
        alert("邮箱已复制：790009027@qq.com");
      }).catch(() => {
        window.location.href = "mailto:790009027@qq.com";
      });
    },
  },
  {
    id: "rss",
    label: "RSS",
    tip: "订阅推送",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
      </svg>
    ),
    action: () => window.open("/feed.xml", "_blank"),
  },
  {
    id: "guestbook",
    label: "留言板",
    tip: "前往留言",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    action: () => {
      const el = document.getElementById("guestbook");
      if (el) {
        window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      } else {
        window.location.href = "/blog#guestbook";
      }
    },
  },
  {
    id: "top",
    label: "回到顶部",
    tip: "",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    ),
    action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
];

export default function SocialIcons() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("0s");

  // 本次访问计时
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const sec = Math.floor((Date.now() - start) / 1000);
      if (sec < 60) setElapsed(`${sec}s`);
      else if (sec < 3600) setElapsed(`${Math.floor(sec / 60)}m`);
      else setElapsed(`${Math.floor(sec / 3600)}h`);
    };
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-end gap-2.5">
      <div className="flex items-center gap-2">
        {ITEMS.map(({ id, label, tip, icon, action }) => (
          <button
            key={id}
            onClick={action}
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.40)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              setHovered(id);
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              e.currentTarget.style.borderColor = "rgba(200,180,240,0.40)";
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.transform = "translateY(-4px) scale(1.15)";
            }}
            onMouseLeave={(e) => {
              setHovered(null);
              e.currentTarget.style.color = "rgba(255,255,255,0.30)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.transform = "";
            }}
          >
            {icon}
            {hovered === id && (
              <span
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(20,16,40,0.90)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(200,180,240,0.25)",
                  color: "rgba(255,255,255,0.70)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              >
                {label}{tip ? ` · ${tip}` : ""}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* 底部小字 */}
      <p className="text-[9px] text-right"
        style={{ color: "rgba(255,255,255,0.30)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
        已驻留 {elapsed}
      </p>
    </div>
  );
}
