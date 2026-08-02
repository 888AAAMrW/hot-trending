"use client";

const TAGS = [
  { label: "前端开发",     stops: ["255,140,160", "255,100,200", "160,130,255", "100,200,240"] },
  { label: "AI项目开发",   stops: ["160,140,240", "255,130,200", "255,200,120", "130,220,180"] },
  { label: "3D模型调试",   stops: ["120,180,240", "100,230,200", "180,240,100", "240,180,120"] },
  { label: "网页可视化",   stops: ["100,200,190", "130,160,255", "240,140,200", "180,230,120"] },
  { label: "Python编程",   stops: ["130,200,130", "100,220,220", "200,160,255", "240,210,100"] },
  { label: "代码与浪漫",   stops: ["240,140,180", "255,100,150", "180,120,240", "255,200,140"] },
  { label: "交互式小世界", stops: ["240,180,100", "255,140,160", "160,200,255", "200,240,130"] },
  { label: "熬夜调试选手", stops: ["170,150,230", "130,190,255", "200,140,240", "140,220,200"] },
];

export default function ProfileTags() {
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
      {TAGS.map(({ label, stops }) => {
        const grad = (ops: number[]) =>
          `linear-gradient(150deg, ${stops.map((c, i) => `rgba(${c},${ops[i]})`).join(",")})`;

        const baseOps = [0.36, 0.28, 0.22, 0.18];
        const hoverOps = [0.52, 0.40, 0.32, 0.26];

        const glass = (ops: number[]) => ({
          background: grad(ops),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: [
            // 顶部高光 — 液态玻璃反光
            "inset 0 1px 0 rgba(255,255,255,0.45)",
            // 上部柔光扩散
            "inset 0 2px 8px rgba(255,255,255,0.12)",
            // 底部暗影 — 厚度感
            "inset 0 -2px 4px rgba(0,0,0,0.10)",
            // 彩色边框
            `0 0 0 1px rgba(${stops[0]}, 0.10)`,
            // 悬浮投影
            "0 2px 6px rgba(0,0,0,0.15)",
          ].join(", "),
        });

        return (
          <span
            key={label}
            className="text-[11px] px-3 py-1.5 rounded-xl text-center
                       text-white/85 font-light
                       hover:scale-105 transition-all duration-200"
            style={glass(baseOps)}
            onMouseEnter={(e) => {
              Object.assign((e.currentTarget as HTMLElement).style, glass(hoverOps));
            }}
            onMouseLeave={(e) => {
              Object.assign((e.currentTarget as HTMLElement).style, glass(baseOps));
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
