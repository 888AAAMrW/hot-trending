"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; z: number;
  r: number; hue: number;
  angle: number; orbitR: number;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  hue: number;
}

interface Props {
  active: boolean;
  onComplete: () => void;
}

export default function WarpTransition({ active, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
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

    // 深空星场 — 四层
    const stars: Star[] = [];
    for (let layer = 0; layer < 4; layer++) {
      const count = [400, 800, 1200, 600][layer];
      for (let i = 0; i < count; i++) {
        const r = 80 + layer * 180 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        stars.push({
          x: Math.cos(theta) * Math.sin(phi) * r,
          y: Math.sin(theta) * Math.sin(phi) * r,
          z: Math.cos(phi) * r + (layer - 2) * 100,
          r: 0.2 + Math.random() * (1.6 - layer * 0.3),
          hue: 210 + Math.random() * 50 - layer * 8,
          angle: Math.random() * Math.PI * 2,
          orbitR: r,
        });
      }
    }

    // 离散火花粒子
    let sparks: Spark[] = [];

    // 尾迹缓冲区
    const trailCanvas = document.createElement("canvas");
    trailCanvas.width = W; trailCanvas.height = H;
    const trailCtx = trailCanvas.getContext("2d")!;

    function spawnSparks(x: number, y: number, count: number, hue: number) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 0.5 + Math.random() * 4;
        sparks.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0,
          maxLife: 15 + Math.random() * 35,
          hue: hue + Math.random() * 30 - 15,
        });
      }
    }

    function draw() {
      if (done) return;
      frame++;
      const FPS = 60;
      const totalFrames = 2 * FPS; // 2 秒
      const t = Math.min(1, frame / totalFrames);

      // 加速曲线 — 指数级
      const speedCurve = (x: number) => {
        if (x < 0.15) return x / 0.15 * 2;
        if (x < 0.5) return 2 + (x - 0.15) / 0.35 * 6;
        if (x < 0.85) return 8 + (x - 0.5) / 0.35 * 25;
        return 33 + Math.pow((x - 0.85) / 0.15, 3) * 120;
      };
      const speed = speedCurve(t);

      // 拖尾 — 上一帧半透明覆盖，产生残影
      trailCtx.fillStyle = "rgba(1, 3, 10, 0.15)";
      trailCtx.fillRect(0, 0, W, H);

      // 画持久尾迹
      ctx!.drawImage(trailCanvas, 0, 0);

      // 再画星星到尾迹层
      trailCtx.clearRect(0, 0, W, H);
      ctx!.fillStyle = "rgba(1, 3, 10, 0.3)";
      trailCtx.fillRect(0, 0, W, H);

      // 虫洞中心坐标（带微小晃动）
      const shake = t > 0.4 ? Math.sin(frame * 0.7) * (t - 0.4) * 15 : 0;
      const wcx = cx + shake;
      const wcy = cy + shake * 0.7;

      // ── 引力透镜环 ──
      for (let ring = 0; ring < 3; ring++) {
        const ringT = Math.max(0, Math.min(1, (t - ring * 0.12) * 3));
        const ringR = (1 - ringT) * 280 + ringT * 20;
        const ringAlpha = ringT < 0.5 ? ringT * 2 * 0.25 : (1 - ringT) * 2 * 0.25;

        if (ringAlpha > 0.01) {
          const grad = ctx!.createRadialGradient(wcx, wcy, ringR * 0.85, wcx, wcy, ringR * 1.15);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.48, `rgba(140, 180, 255, ${ringAlpha * 0.4})`);
          grad.addColorStop(0.5, `rgba(200, 220, 255, ${ringAlpha})`);
          grad.addColorStop(0.52, `rgba(140, 180, 255, ${ringAlpha * 0.4})`);
          grad.addColorStop(1, "transparent");
          ctx!.fillStyle = grad;
          ctx!.fillRect(0, 0, W, H);
        }
      }

      // ── 脉冲同心环 ──
      for (let pulse = 0; pulse < 5; pulse++) {
        const pulsePhase = (t * 3 + pulse * 0.2) % 1;
        const pulseR = pulsePhase * W * 0.7 + 20;
        const pulseAlpha = Math.sin(pulsePhase * Math.PI) * 0.12 * Math.min(1, t * 2);

        if (pulseAlpha > 0.005) {
          ctx!.beginPath();
          ctx!.arc(wcx, wcy, pulseR, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(180, 210, 255, ${pulseAlpha})`;
          ctx!.lineWidth = 1.5 + pulsePhase * 3;
          ctx!.stroke();
        }
      }

      // ── 星场绘制 ──
      for (const s of stars) {
        // 螺旋运动：越近中心转得越快
        const dist = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
        const swirlFactor = speed * 0.04 / Math.max(0.1, dist / 400);
        s.angle += swirlFactor;
        s.orbitR -= speed * 2.5;

        if (s.orbitR < 1) {
          // 重生在远处
          const newR = 400 + Math.random() * 300;
          const newTheta = Math.random() * Math.PI * 2;
          const newPhi = Math.acos(2 * Math.random() - 1);
          s.orbitR = newR;
          s.angle = newTheta;
          s.x = Math.cos(newTheta) * Math.sin(newPhi) * newR;
          s.y = Math.sin(newTheta) * Math.sin(newPhi) * newR;
          s.z = Math.cos(newPhi) * newR;
        } else {
          s.x = Math.cos(s.angle) * s.orbitR * 0.8;
          s.y = Math.sin(s.angle) * s.orbitR * 0.7;
          s.z = s.orbitR * 0.5;
        }

        // 投影到屏幕
        const scale = 500 / (500 + s.z);
        const sx = wcx + s.x * scale;
        const sy = wcy + s.y * scale;

        const onScreen = sx > -60 && sx < W + 60 && sy > -60 && sy < H + 60;
        if (!onScreen) continue;

        // 光轨长度
        const streakLen = speed * scale * 1.2;
        const dx = (sx - wcx) * 0.003 * streakLen;
        const dy = (sy - wcy) * 0.003 * streakLen;

        const alpha = Math.min(1, 0.15 + scale * 0.85);
        const hueShift = t > 0.4 ? (t - 0.4) / 0.6 * 50 : 0;
        const hue = (s.hue - hueShift + 360) % 360;

        // 主光轨
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(sx - dx, sy - dy);
        const grad = ctx!.createLinearGradient(sx, sy, sx - dx, sy - dy);
        grad.addColorStop(0, `hsla(${hue}, 70%, ${55 + scale * 35}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, 40%, 30%, 0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = s.r * scale * 0.7;
        ctx!.stroke();

        // 星核亮点
        const coreAlpha = alpha * (0.7 + Math.sin(frame * 0.15 + s.angle) * 0.3);
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.r * scale * 0.4, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 20%, 95%, ${coreAlpha})`;
        ctx!.fill();

        // 亮星辉光
        if (s.r > 1 && coreAlpha > 0.4) {
          const glowR = s.r * scale * 3;
          const glow = ctx!.createRadialGradient(sx, sy, s.r * scale * 0.3, sx, sy, glowR);
          glow.addColorStop(0, `hsla(${hue}, 30%, 90%, ${coreAlpha * 0.3})`);
          glow.addColorStop(1, "transparent");
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(sx, sy, glowR, 0, Math.PI * 2);
          ctx!.fill();
        }

        // 尾迹画到 trail 层
        trailCtx.beginPath();
        trailCtx.moveTo(sx, sy);
        trailCtx.lineTo(sx - dx * 0.5, sy - dy * 0.5);
        trailCtx.strokeStyle = `hsla(${hue}, 50%, 40%, ${alpha * 0.15})`;
        trailCtx.lineWidth = s.r * scale * 0.3;
        trailCtx.stroke();
      }

      // ── 火花粒子 ──
      if (t > 0.1 && Math.random() < speed * 0.08) {
        const sparkAng = Math.random() * Math.PI * 2;
        const sparkDist = 10 + Math.random() * 30;
        spawnSparks(wcx + Math.cos(sparkAng) * sparkDist, wcy + Math.sin(sparkAng) * sparkDist, Math.floor(2 + speed * 0.8), 200 + Math.random() * 40);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        const lifeRatio = 1 - sp.life / sp.maxLife;
        if (lifeRatio <= 0) { sparks.splice(i, 1); continue; }

        ctx!.beginPath();
        ctx!.arc(sp.x, sp.y, 0.8 * lifeRatio, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${sp.hue}, 80%, 80%, ${lifeRatio})`;
        ctx!.fill();
      }

      // ── 中心光晕 ──
      if (t > 0.05) {
        const glowAlpha = Math.min(0.7, (t - 0.05) * 2) * Math.min(1, speed / 8);
        const centerGlow = ctx!.createRadialGradient(wcx, wcy, 0, wcx, wcy, W * 0.55);
        centerGlow.addColorStop(0, `rgba(220, 235, 255, ${glowAlpha})`);
        centerGlow.addColorStop(0.15, `rgba(150, 190, 255, ${glowAlpha * 0.5})`);
        centerGlow.addColorStop(0.4, `rgba(80, 120, 220, ${glowAlpha * 0.15})`);
        centerGlow.addColorStop(1, "transparent");
        ctx!.fillStyle = centerGlow;
        ctx!.fillRect(0, 0, W, H);
      }

      // ── 末期白闪 → 全白 ──
      if (t > 0.8) {
        const flashT = (t - 0.8) / 0.2;
        // 先蓝白闪
        if (flashT < 0.6) {
          ctx!.fillStyle = `rgba(180, 200, 255, ${flashT / 0.6 * 0.3})`;
          ctx!.fillRect(0, 0, W, H);
        } else {
          // 全白
          ctx!.fillStyle = `rgba(255, 255, 255, ${(flashT - 0.6) / 0.4})`;
          ctx!.fillRect(0, 0, W, H);
        }
      }

      // ── 暗角 ──
      const vignette = ctx!.createRadialGradient(wcx, wcy, W * 0.25, wcx, wcy, W * 0.75);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0, 0, 8, 0.6)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, W, H);

      if (t >= 1) {
        done = true;
        trailCtx.clearRect(0, 0, W, H);
        cancelAnimationFrame(animId);
        ctx!.fillStyle = "#fff";
        ctx!.fillRect(0, 0, W, H);
        setTimeout(onComplete, 80);
        return;
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => { done = true; cancelAnimationFrame(animId); };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        zIndex: 9999,
        background: "#010308",
        cursor: "none",
      }}
      aria-hidden="true"
    />
  );
}
