"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; z: number;
  r: number; hue: number;
  angle: number; orbitR: number;
}

interface Props {
  active: boolean;
  onComplete: () => void;
}

const DURATION = 1500; // 1.5 秒
const SAFETY_TIMEOUT = 6000; // 兜底 6 秒强制跳转

export default function WarpTransition({ active, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let startTime = 0;
    let animId = 0;
    let done = false;

    // 1500 颗星 — 移动端也能跑
    const stars: Star[] = [];
    for (let i = 0; i < 1500; i++) {
      const r = 100 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      stars.push({
        x: Math.cos(theta) * Math.sin(phi) * r,
        y: Math.sin(theta) * Math.sin(phi) * r,
        z: Math.cos(phi) * r,
        r: 0.3 + Math.random() * 2,
        hue: 200 + Math.random() * 55,
        angle: Math.random() * Math.PI * 2,
        orbitR: r,
      });
    }

    // 安全兜底定时器
    const safety = setTimeout(() => {
      if (!done) {
        done = true;
        cancelAnimationFrame(animId);
        onCompleteRef.current();
      }
    }, SAFETY_TIMEOUT);

    function draw(ts: number) {
      if (done) return;
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(1, elapsed / DURATION);

      // 加速曲线
      const speed = t < 0.15 ? t / 0.15 * 2
        : t < 0.5 ? 2 + (t - 0.15) / 0.35 * 7
        : t < 0.8 ? 9 + (t - 0.5) / 0.3 * 30
        : 39 + Math.pow((t - 0.8) / 0.2, 3) * 150;

      ctx!.clearRect(0, 0, W, H);

      // 背景
      ctx!.fillStyle = "#010308";
      ctx!.fillRect(0, 0, W, H);

      const shake = t > 0.3 ? Math.sin(elapsed * 0.004) * (t - 0.3) * 20 : 0;
      const wcx = W / 2 + shake;
      const wcy = H / 2 + shake * 0.7;

      // 虫洞环
      for (let ring = 0; ring < 2; ring++) {
        const rt = Math.max(0, Math.min(1, (t - ring * 0.1) * 4));
        const rr = (1 - rt) * 250 + rt * 15;
        const ra = rt < 0.5 ? rt * 2 * 0.2 : (1 - rt) * 2 * 0.2;
        if (ra > 0.01) {
          ctx!.beginPath();
          ctx!.arc(wcx, wcy, rr, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(160, 200, 255, ${ra})`;
          ctx!.lineWidth = 2;
          ctx!.stroke();
        }
      }

      // 脉冲波
      for (let p = 0; p < 3; p++) {
        const phase = (t * 2.5 + p * 0.33) % 1;
        const pr = phase * W * 0.6 + 10;
        const pa = Math.sin(phase * Math.PI) * 0.1 * Math.min(1, t * 3);
        if (pa > 0.005) {
          ctx!.beginPath();
          ctx!.arc(wcx, wcy, pr, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(180, 210, 255, ${pa})`;
          ctx!.lineWidth = 1 + phase * 2;
          ctx!.stroke();
        }
      }

      // 星场
      for (const s of stars) {
        const dist = Math.sqrt(s.x * s.x + s.y * s.y);
        s.angle += speed * 0.03 / Math.max(0.1, dist / 400);
        s.orbitR -= speed * 2.5;

        if (s.orbitR < 2) {
          s.orbitR = 400 + Math.random() * 300;
          s.angle = Math.random() * Math.PI * 2;
        }

        s.x = Math.cos(s.angle) * s.orbitR * 0.7;
        s.y = Math.sin(s.angle) * s.orbitR * 0.6;

        const scale = 500 / (500 + s.orbitR * 0.5);
        const sx = wcx + s.x * scale;
        const sy = wcy + s.y * scale;

        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;

        const streak = speed * scale * 0.9;
        const dx = (sx - wcx) * 0.002 * streak;
        const dy = (sy - wcy) * 0.002 * streak;

        const alpha = Math.min(1, 0.2 + scale * 0.8);
        const hueShift = t > 0.4 ? (t - 0.4) / 0.6 * 45 : 0;
        const hue = (s.hue - hueShift + 360) % 360;

        // 光轨
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(sx - dx, sy - dy);
        ctx!.strokeStyle = `hsla(${hue}, 70%, ${55 + scale * 35}%, ${alpha})`;
        ctx!.lineWidth = s.r * scale * 0.6;
        ctx!.stroke();

        // 星核
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.r * scale * 0.35, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 20%, 95%, ${alpha * 0.8})`;
        ctx!.fill();
      }

      // 中心光晕
      const glowAlpha = Math.min(0.6, t * 3) * Math.min(1, speed / 5);
      const glow = ctx!.createRadialGradient(wcx, wcy, 0, wcx, wcy, W * 0.5);
      glow.addColorStop(0, `rgba(220, 235, 255, ${glowAlpha})`);
      glow.addColorStop(0.2, `rgba(140, 180, 255, ${glowAlpha * 0.4})`);
      glow.addColorStop(1, "transparent");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, W, H);

      // 暗角
      const vig = ctx!.createRadialGradient(wcx, wcy, W * 0.25, wcx, wcy, W * 0.8);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0, 0, 8, 0.55)");
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, W, H);

      // 白闪
      if (t > 0.75) {
        const bt = (t - 0.75) / 0.25;
        if (bt < 0.5) {
          ctx!.fillStyle = `rgba(180, 200, 255, ${bt / 0.5 * 0.25})`;
        } else {
          ctx!.fillStyle = `rgba(255, 255, 255, ${(bt - 0.5) / 0.5})`;
        }
        ctx!.fillRect(0, 0, W, H);
      }

      if (t >= 1) {
        done = true;
        clearTimeout(safety);
        cancelAnimationFrame(animId);
        ctx!.fillStyle = "#fff";
        ctx!.fillRect(0, 0, W, H);
        setTimeout(() => onCompleteRef.current(), 60);
        return;
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      done = true;
      clearTimeout(safety);
      cancelAnimationFrame(animId);
    };
  }, [active]);

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
