"use client";

import { useEffect, useState } from "react";

export default function TimeOrb() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="w-40 h-40" />;

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const wd = weekdays[time.getDay()];

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* 外环 — 粉色渐变虚线圆 */}
      <div className="absolute inset-0 rounded-full animate-orb-outer"
        style={{ border: "2.5px dashed rgba(255,140,170,0.55)" }} />

      {/* 内环 — 蓝紫渐变圆 */}
      <div className="absolute inset-[14px] rounded-full animate-orb-inner"
        style={{ border: "2px solid rgba(150,170,240,0.5)" }} />

      {/* 表盘底 */}
      <div className="absolute inset-[30px] rounded-full"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }} />

      {/* 时间文字 */}
      <div className="relative z-10 text-center">
        <div className="text-[17px] font-light text-white/90 tracking-[0.06em] leading-none">
          {hh}:{mm}
        </div>
        <div className="text-[11px] text-white/35 tracking-wider mt-1">
          {month}月{day}日 周{wd}
        </div>
      </div>
    </div>
  );
}
