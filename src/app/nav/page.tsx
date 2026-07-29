"use client";

import Starfield from "@/components/Starfield";

const PROJECTS = [
  {
    name: "实时热搜",
    desc: "知乎 · B站 · 微博一站式热搜聚合",
    url: "https://hot.starrynova.cc",
    icon: "🔥",
    color: "#E6162D",
  },
];

export default function NavPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Starfield />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-20">
        {/* 头部 */}
        <div className="text-center animate-header-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
            ✦ Starry Nova ✦
          </h1>
          <p className="mt-3 text-sm text-gray-500 tracking-[0.3em] uppercase">
            深空观测站
          </p>
        </div>

        {/* 项目卡片 */}
        <div className="flex flex-wrap justify-center gap-6">
          {PROJECTS.map((p, i) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/card relative rounded-2xl overflow-hidden w-72 transition-all duration-500 hover:scale-105"
              style={{
                animationDelay: `${0.2 + i * 0.15}s`,
                background: "rgba(8, 10, 24, 0.55)",
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                boxShadow: [
                  "0 0 0 1px rgba(255,255,255,0.06)",
                  `0 0 0 3px ${p.color}08`,
                  `0 0 60px ${p.color}10`,
                  `inset 0 1px 0 rgba(255,255,255,0.03)`,
                  `inset 0 0 40px ${p.color}05`,
                ].join(", "),
              }}
            >
              {/* 顶部光条 */}
              <div
                className="absolute top-0 left-0 right-0 h-px z-10 opacity-40 group-hover/card:opacity-70 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent 5%, ${p.color}40 20%, ${p.color}70 50%, ${p.color}40 80%, transparent 95%)`,
                }}
              />

              {/* 内容 */}
              <div className="relative z-10 p-8 flex flex-col items-center gap-4 text-center">
                <span className="text-4xl">{p.icon}</span>
                <h2
                  className="text-lg font-semibold tracking-wider"
                  style={{
                    color: "#e0e0e0",
                    textShadow: `0 0 24px ${p.color}30`,
                  }}
                >
                  {p.name}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {p.desc}
                </p>
                <span
                  className="text-xs px-4 py-1.5 rounded-full mt-2 transition-colors group-hover/card:text-white"
                  style={{
                    backgroundColor: `${p.color}10`,
                    color: p.color,
                    border: `1px solid ${p.color}20`,
                  }}
                >
                  {p.url.replace("https://", "")} →
                </span>
              </div>

              {/* 四角铆钉 */}
              {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
                <div
                  key={pos}
                  className={`absolute ${pos} w-1.5 h-1.5 rounded-full z-20 opacity-30 group-hover/card:opacity-50 transition-opacity duration-700`}
                  style={{ backgroundColor: p.color, boxShadow: `0 0 4px ${p.color}` }}
                />
              ))}

              {/* 呼吸光晕 */}
              <div
                className="absolute -inset-1 rounded-2xl pointer-events-none breathe-glow"
                style={{
                  background: `radial-gradient(ellipse at center, ${p.color}15 0%, transparent 70%)`,
                  filter: "blur(8px)",
                  zIndex: -1,
                }}
              />
            </a>
          ))}
        </div>

        {/* 底部 */}
        <footer className="text-center text-xs text-gray-700">
          更多项目即将上线 · 星际航行中 🚀
        </footer>
      </div>
    </div>
  );
}
