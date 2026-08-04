"use client";

const TAGS = [
  { label: "前端开发",     stops: ["180,160,220", "160,140,210", "140,130,200"] },
  { label: "AI项目开发",   stops: ["170,150,210", "150,130,200", "200,170,210"] },
  { label: "3D模型调试",   stops: ["160,140,200", "140,160,200", "170,150,200"] },
  { label: "网页可视化",   stops: ["150,140,200", "170,160,210", "160,150,200"] },
  { label: "Python编程",   stops: ["160,150,190", "140,160,200", "170,160,210"] },
  { label: "代码与浪漫",   stops: ["180,160,210", "160,140,200", "190,160,210"] },
  { label: "交互式小世界", stops: ["170,150,200", "150,160,200", "180,160,210"] },
  { label: "熬夜调试选手", stops: ["160,140,200", "150,160,210", "170,150,200"] },
];

export default function ProfileTags() {
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
      {TAGS.map(({ label, stops }) => {
        const grad = (ops: number[]) =>
          `linear-gradient(150deg, ${stops.map((c, i) => `rgba(${c},${ops[i]})`).join(",")})`;

        const baseOps = [0.22, 0.18, 0.14];
        const hoverOps = [0.40, 0.32, 0.24];

        const glass = (ops: number[], hover: boolean) => ({
          background: grad(ops),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: hover
            ? [
                "inset 0 1px 0 rgba(255,255,255,0.40)",
                "inset 0 2px 8px rgba(255,255,255,0.10)",
                "inset 0 -2px 4px rgba(0,0,0,0.08)",
                "0 0 0 1px rgba(200,180,240,0.15)",
                "0 0 12px rgba(180,160,220,0.12)",
                "0 2px 6px rgba(0,0,0,0.12)",
              ].join(", ")
            : [
                "inset 0 1px 0 rgba(255,255,255,0.20)",
                "inset 0 -1px 2px rgba(0,0,0,0.06)",
                "0 0 0 1px rgba(255,255,255,0.06)",
              ].join(", "),
        });

        return (
          <span
            key={label}
            className="text-[11px] px-3 py-1.5 rounded-xl text-center
                       text-white/85 font-light
                       hover:scale-105 transition-all duration-200"
            style={glass(baseOps, false)}
            onMouseEnter={(e) => {
              Object.assign((e.currentTarget as HTMLElement).style, glass(hoverOps, true));
            }}
            onMouseLeave={(e) => {
              Object.assign((e.currentTarget as HTMLElement).style, glass(baseOps, false));
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
