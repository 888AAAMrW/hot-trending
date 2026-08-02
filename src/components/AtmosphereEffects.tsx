"use client";

import { useEffect, useRef, useCallback } from "react";

interface Mote {
  x: number;
  y: number;
  life: number;   // 1 → 0
  size: number;
  vx: number;
  vy: number;
  color: [number, number, number]; // rgb
}

// 液态玻璃色板
const PALETTE: [number, number, number][] = [
  [255, 100, 160], // 糖果粉
  [180, 120, 255], // 薰衣草紫
  [80, 170, 255],  // 天蓝
  [70, 225, 200],  // 薄荷青
  [255, 170, 100], // 蜜橙
  [255, 80, 170],  // 洋红
  [160, 235, 110], // 荧光绿
  [255, 200, 130], // 香槟金
  [140, 160, 255], // 鸢尾蓝
  [255, 140, 200], // 樱花粉
];

export default function AtmosphereEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let prevX = -100;
    let prevY = -100;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed < 3) return;

      const count = Math.min(Math.floor(speed / 4), 4);
      for (let i = 0; i < count; i++) {
        const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.5;
        const force = 0.5 + Math.random() * speed * 0.06;
        motesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          life: 1,
          size: 1.5 + Math.random() * 3,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force - Math.random() * 1,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
    };

    window.addEventListener("mousemove", handleMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const MAX = 80;
      if (motesRef.current.length > MAX) {
        motesRef.current.splice(0, motesRef.current.length - MAX);
      }

      for (let i = motesRef.current.length - 1; i >= 0; i--) {
        const m = motesRef.current[i];
        m.life -= 0.015;
        if (m.life <= 0) {
          motesRef.current.splice(i, 1);
          continue;
        }

        m.x += m.vx;
        m.y += m.vy;
        m.vy -= 0.015; // 轻微上浮（反重力）
        m.vx *= 0.992;

        const t = m.life;
        const [r, g, b] = m.color;
        const alpha = t * 0.7;
        const size = m.size * (0.3 + t * 0.7);

        // 光点本体
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
        ctx.fill();

        // 柔光晕
        ctx.beginPath();
        ctx.arc(m.x, m.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(alpha * 0.12).toFixed(2)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-20 pointer-events-none"
      aria-hidden="true"
    />
  );
}
