"use client";

// 11个扇区：角度错落，长短微差
const SECTORS = [
  { angle: 38, r: 108, color: "rgba(255,80,145,0.72)" },   // 糖果粉
  { angle: 26, r: 98,  color: "rgba(225,70,195,0.7)" },    // 霓虹紫红
  { angle: 40, r: 104, color: "rgba(155,100,250,0.72)" },  // 紫水晶
  { angle: 22, r: 92,  color: "rgba(105,125,250,0.73)" },  // 鸢尾蓝
  { angle: 36, r: 106, color: "rgba(55,165,250,0.72)" },   // 天蓝宝石
  { angle: 28, r: 96,  color: "rgba(15,205,225,0.73)" },   // 湖蓝
  { angle: 34, r: 100, color: "rgba(15,220,165,0.72)" },   // 翡翠绿
  { angle: 24, r: 92,  color: "rgba(90,230,70,0.73)" },    // 荧光绿
  { angle: 42, r: 110, color: "rgba(250,195,30,0.72)" },   // 金琥珀
  { angle: 30, r: 96,  color: "rgba(250,115,70,0.73)" },   // 蜜橘
  { angle: 40, r: 104, color: "rgba(255,70,135,0.72)" },   // 玫瑰红
];
// 360° ✓

const SIZE = 248;
const CX = SIZE / 2; // 124

export default function ColorWheel() {
  let currentAngle = -90;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* 外层光环 */}
      <svg className="absolute inset-0 animate-orb-outer" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CX} r={CX - 4} fill="none"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"
          strokeDasharray="10 18" />
      </svg>

      {/* 不规则彩色扇区 */}
      <svg className="absolute inset-0 animate-wheel" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {SECTORS.map(({ angle, r, color }, i) => {
          const startRad = currentAngle * (Math.PI / 180);
          const endRad = (currentAngle + angle) * (Math.PI / 180);

          const x1 = CX + r * Math.cos(startRad);
          const y1 = CX + r * Math.sin(startRad);
          const x2 = CX + r * Math.cos(endRad);
          const y2 = CX + r * Math.sin(endRad);

          currentAngle += angle;

          return (
            <path
              key={i}
              d={`M${CX},${CX} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
              fill={color}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>

      {/* 内层光环 — 逆时针 */}
      <div className="absolute animate-orb-inner rounded-full"
           style={{
             inset: "30px",
             border: "1.5px dashed rgba(255,255,255,0.15)",
           }} />

      {/* 玻璃高光 */}
      <div className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.2) 0%, transparent 50%)",
        }} />

      {/* 外框 */}
      <div className="absolute inset-0 rounded-full border border-white/[0.15]" />
    </div>
  );
}
