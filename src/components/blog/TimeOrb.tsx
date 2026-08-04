"use client";

import { useEffect, useState } from "react";

/* 标准七段数码管：A-G */
const SEGMENTS: Record<string, number[]> = {
  "0": [1,1,1,0,1,1,1],
  "1": [0,0,1,0,0,1,0],
  "2": [1,0,1,1,1,0,1],
  "3": [1,0,1,1,0,1,1],
  "4": [0,1,1,1,0,1,0],
  "5": [1,1,0,1,0,1,1],
  "6": [1,1,0,1,1,1,1],
  "7": [1,0,1,0,0,1,0],
  "8": [1,1,1,1,1,1,1],
  "9": [1,1,1,1,0,1,1],
};

function Digit({ value, size = 24 }: { value: string; size?: number }) {
  const seg = SEGMENTS[value] || SEGMENTS["0"];
  const pad = size * 0.06;
  const barH = size * 0.09;
  const barW = size * 0.28;
  const mid = size / 2;
  const viewH = size * 1.5;
  const halfH = viewH / 2;

  const on = "rgba(240,225,255,0.92)";
  const off = "rgba(255,220,240,0.06)";

  return (
    <svg width={size} height={viewH} viewBox={`0 0 ${size} ${viewH}`}
      style={{ filter: "drop-shadow(0 0 4px rgba(240,225,255,0.25))" }}>
      <rect x={pad} y={0} width={size - pad*2} height={barH} rx={barH/2} fill={seg[0]?on:off} />
      <rect x={0} y={pad} width={barW} height={halfH - pad - barH/2} rx={barH/2} fill={seg[1]?on:off} />
      <rect x={size-barW} y={pad} width={barW} height={halfH - pad - barH/2} rx={barH/2} fill={seg[2]?on:off} />
      <rect x={pad} y={halfH - barH/2} width={size - pad*2} height={barH} rx={barH/2} fill={seg[3]?on:off} />
      <rect x={0} y={halfH + barH/2} width={barW} height={halfH - pad - barH/2} rx={barH/2} fill={seg[4]?on:off} />
      <rect x={size-barW} y={halfH + barH/2} width={barW} height={halfH - pad - barH/2} rx={barH/2} fill={seg[5]?on:off} />
      <rect x={pad} y={viewH - barH} width={size - pad*2} height={barH} rx={barH/2} fill={seg[6]?on:off} />
    </svg>
  );
}

function Colon() {
  return (
    <div className="flex flex-col gap-[14px] pb-1 mx-0.5">
      <div className="w-2 h-2 rounded-full"
        style={{ background: "rgba(240,225,255,0.85)", boxShadow: "0 0 8px rgba(200,180,240,0.5)" }} />
      <div className="w-2 h-2 rounded-full"
        style={{ background: "rgba(240,225,255,0.85)", boxShadow: "0 0 8px rgba(200,180,240,0.5)" }} />
    </div>
  );
}

function RadarRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 外层雷达 — 慢转 */}
      <svg className="absolute inset-0 animate-orb-outer" viewBox="0 0 280 200">
        <defs>
          <radialGradient id="scan-glow" cx="164" cy="100" r="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(200,180,240,0.04)" />
            <stop offset="85%" stopColor="rgba(200,180,240,0.01)" />
            <stop offset="95%" stopColor="rgba(200,180,240,0.12)" />
            <stop offset="100%" stopColor="rgba(200,180,240,0.18)" />
          </radialGradient>
        </defs>
        <circle cx="164" cy="100" r="120" fill="url(#scan-glow)" />
        {/* 外圈 — 细线 */}
        <circle cx="164" cy="100" r="120" fill="none"
          stroke="rgba(200,180,240,0.35)" strokeWidth="1.2" />
        <circle cx="164" cy="100" r="105" fill="none"
          stroke="rgba(200,180,240,0.25)" strokeWidth="1" />
        <circle cx="164" cy="100" r="88" fill="none"
          stroke="rgba(255,180,200,0.25)" strokeWidth="1" />
        {/* 罗盘点 */}
        <circle cx="164" cy="100" r="120" fill="none" stroke="rgba(200,180,240,0.4)" strokeWidth="1.2"
          strokeDasharray="2 85" strokeDashoffset="21" />
        <circle cx="164" cy="100" r="88" fill="none" stroke="rgba(255,180,200,0.3)" strokeWidth="1"
          strokeDasharray="2 66" strokeDashoffset="16" />
      </svg>

      {/* 内层雷达 — 逆时针慢转 */}
      <svg className="absolute inset-[10px] animate-orb-inner" viewBox="0 0 260 180">
        <circle cx="159" cy="90" r="110" fill="none"
          stroke="rgba(200,180,240,0.3)" strokeWidth="1"
          strokeDasharray="8 14" />
        <circle cx="159" cy="90" r="98" fill="none"
          stroke="rgba(255,180,200,0.25)" strokeWidth="1" />
        <circle cx="159" cy="90" r="110" fill="none" stroke="rgba(200,180,240,0.35)" strokeWidth="1"
          strokeDasharray="2 80" strokeDashoffset="40" />
      </svg>

      {/* 呼吸脉冲 — 静止装饰 */}
      <div className="absolute inset-0 rounded-full"
        style={{
          border: "1.2px solid rgba(200,180,240,0.10)",
        }} />
      <div className="absolute inset-[30px] rounded-full"
        style={{
          border: "0.8px solid rgba(255,180,200,0.08)",
        }} />
    </div>
  );
}

export default function TimeOrb() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 200);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="w-[280px] h-[200px]" />;

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const year = time.getFullYear();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const wd = weekdays[time.getDay()];

  return (
    <div className="relative flex flex-col items-center justify-center"
         style={{ width: 280, height: 200 }}>
      <RadarRings />

      {/* 时钟 + 日期 上下排列 */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {/* HH:MM:SS */}
        <div className="flex items-center gap-0.5"
          style={{ transform: "skewX(-6deg)" }}>
          <Digit value={hh[0]} size={22} />
          <Digit value={hh[1]} size={22} />
          <Colon />
          <Digit value={mm[0]} size={22} />
          <Digit value={mm[1]} size={22} />
          <Colon />
          <Digit value={ss[0]} size={22} />
          <Digit value={ss[1]} size={22} />
        </div>

        {/* 日期 */}
        <div className="text-lg tracking-[0.04em] leading-none ml-2 mt-1.5 whitespace-nowrap"
          style={{
            fontFamily: "'Orbitron', monospace",
            color: "rgba(230,215,245,0.75)",
            textShadow: "0 0 14px rgba(200,170,240,0.40), 0 0 4px rgba(255,240,255,0.20)",
          }}>
          {year}年{month}月{day}日 周{wd}
        </div>
      </div>
    </div>
  );
}
