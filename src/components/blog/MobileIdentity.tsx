"use client";

import { useEffect, useState } from "react";
import ProfileTags from "@/components/blog/ProfileTags";

function MobileClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return <div className="h-5" />;

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-base tracking-[0.06em] text-cyan-200/80"
        style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 8px rgba(150,225,245,0.4)" }}>
        {hh}:{mm}
      </span>
      <span className="text-[10px] text-cyan-200/40 animate-pulse"
        style={{ fontFamily: "'Orbitron', monospace" }}>
        {ss}
      </span>
    </div>
  );
}

export default function MobileIdentity() {
  return (
    <div className="md:hidden flex flex-col items-center gap-4 mb-8">
      {/* 头像 + 时钟 横排 */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full overflow-hidden shrink-0"
          style={{
            border: "2px solid rgba(255,150,180,0.3)",
            boxShadow: "0 0 14px rgba(255,150,180,0.15)",
          }}
        >
          <img
            src="/assets/images/avatar.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 10%" }}
          />
        </div>
        <MobileClock />
      </div>

      {/* 成分标签 */}
      <div
        className="w-full max-w-[260px] rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: "1px solid rgba(255,150,180,0.12)",
        }}
      >
        <p className="text-[10px] text-white/30 tracking-[0.12em] mb-2 text-center">🍬 成分表</p>
        <ProfileTags />
      </div>
    </div>
  );
}
