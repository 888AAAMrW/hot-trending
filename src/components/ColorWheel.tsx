"use client";

export default function ColorWheel() {
  return (
    <div className="relative w-36 h-36">
      <svg className="absolute inset-0 animate-wheel" viewBox="0 0 144 144">
        {/* 六色扇形 */}
        {[
          { from: "rgba(255,140,170,0.5)", to: "rgba(255,140,170,0.3)" },
          { from: "rgba(170,140,250,0.5)", to: "rgba(170,140,250,0.3)" },
          { from: "rgba(90,190,250,0.5)", to: "rgba(90,190,250,0.3)" },
          { from: "rgba(70,220,200,0.5)", to: "rgba(70,220,200,0.3)" },
          { from: "rgba(250,180,100,0.5)", to: "rgba(250,180,100,0.3)" },
          { from: "rgba(255,120,180,0.5)", to: "rgba(255,120,180,0.3)" },
        ].map((color, i) => {
          const startAngle = i * 60;
          const endAngle = (i + 1) * 60;
          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);
          const r = 66;
          const cx = 72, cy = 72;

          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);

          const largeArc = endAngle - startAngle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={color.from}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      {/* 中心点 */}
      <div className="absolute inset-[34%] rounded-full bg-white/[0.12] border border-white/[0.15] backdrop-blur-sm" />
      {/* 外框环 */}
      <div className="absolute inset-0 rounded-full border border-white/[0.12]" />
    </div>
  );
}
