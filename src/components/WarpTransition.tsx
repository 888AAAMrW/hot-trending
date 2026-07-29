"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  r: number; hue: number;
}

interface Props {
  active: boolean;
  onComplete: () => void;
}

export default function WarpTransition({ active, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startWarp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    let frame = 0;
    let animId = 0;
    let done = false;

    // 生成星空粒子
    const stars: Star[] = [];
    for (let i = 0; i < 3000; i++) {
      // 球形分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 600;
      stars.push({
        x: Math.cos(theta) * Math.sin(phi) * r,
        y: Math.sin(theta) * Math.sin(phi) * r,
        z: Math.cos(phi) * r,
        vx: 0, vy: 0, vz: 0,
        r: 0.5 + Math.random() * 1.5,
        hue: 200 + Math.random() * 55,
      });
    }

    function draw() {
      if (done) return;
      frame++;

      ctx!.fillStyle = "rgba(1, 3, 8, 0.35)";
      ctx!.fillRect(0, 0, W, H);

      const progress = frame / 120; // 2 秒 @60fps
      const t = Math.min(1, progress);

      // 加速曲线
      const speed = t < 0.2
        ? t / 0.2 * 3
        : t < 0.7
          ? 3 + (t - 0.2) / 0.5 * 8
          : 11 + (t - 0.7) / 0.3 * 40;

      for (const s of stars) {
        // 计算到屏幕中心的投影
        const scale = 400 / (400 + s.z);
        const sx = cx + s.x * scale;
        const sy = cy + s.y * scale;

        // 不在屏幕内则跳过绘制（但继续更新位置）
        const onScreen = sx > -50 && sx < W + 50 && sy > -50 && sy < H + 50;

        if (onScreen) {
          // 星点随速度拉长
          const streak = speed * scale * 0.8;
          const dx = (sx - cx) * 0.001 * streak;
          const dy = (sy - cy) * 0.001 * streak;

          const alpha = Math.min(1, 0.3 + scale * 0.7);
          const hueShift = t > 0.5 ? (t - 0.5) * 2 * 40 : 0;
          const hue = (s.hue - hueShift + 360) % 360;

          ctx!.beginPath();
          ctx!.moveTo(sx, sy);
          ctx!.lineTo(sx - dx, sy - dy);
          ctx!.strokeStyle = `hsla(${hue}, 80%, ${60 + scale * 30}%, ${alpha})`;
          ctx!.lineWidth = s.r * scale * 0.6;
          ctx!.stroke();

          // 亮点
          ctx!.beginPath();
          ctx!.arc(sx, sy, s.r * scale * 0.5, 0, Math.PI * 2);
          ctx!.fillStyle = `hsla(${hue}, 30%, 90%, ${alpha})`;
          ctx!.fill();
        }

        // 粒子向中心加速
        s.z -= speed * 4;
        if (s.z < -400) {
          s.z = 600;
          s.x = (Math.random() - 0.5) * 800;
          s.y = (Math.random() - 0.5) * 800;
        }
      }

      // 中心光晕
      if (t > 0.1) {
        const glowAlpha = Math.min(1, (t - 0.1) * 3) * 0.6;
        const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
        glow.addColorStop(0, `rgba(200, 220, 255, ${glowAlpha})`);
        glow.addColorStop(0.3, `rgba(100, 150, 255, ${glowAlpha * 0.4})`);
        glow.addColorStop(1, "transparent");
        ctx!.fillStyle = glow;
        ctx!.fillRect(0, 0, W, H);
      }

      // 最后阶段白闪
      if (t > 0.85) {
        const flashAlpha = (t - 0.85) / 0.15;
        ctx!.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx!.fillRect(0, 0, W, H);
      }

      if (t >= 1) {
        done = true;
        cancelAnimationFrame(animId);
        ctx!.fillStyle = "#fff";
        ctx!.fillRect(0, 0, W, H);
        setTimeout(onComplete, 100);
        return;
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
  }, [onComplete]);

  useEffect(() => {
    if (active) startWarp();
  }, [active, startWarp]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 9999, background: "#010308" }}
      aria-hidden="true"
    />
  );
}
