"use client";

import { useEffect, useRef } from "react";

interface Particle {
  angle: number;
  speed: number;
  size: number;
  alpha: number;
  ringIndex: number;
}

export default function OrbitalRings({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId: number;
    let time = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      // 3 条轨道环，不同倾角和速度
      for (let ring = 0; ring < 3; ring++) {
        const count = 12 + ring * 6;
        for (let i = 0; i < count; i++) {
          particles.push({
            angle: (i / count) * Math.PI * 2 + ring * 0.8,
            speed: 0.003 + ring * 0.002 + Math.random() * 0.002,
            size: 0.6 + Math.random() * 1.2,
            alpha: 0.3 + Math.random() * 0.5,
            ringIndex: ring,
          });
        }
      }
    }

    function draw(time: number) {
      const w = canvas!.width / (window.devicePixelRatio || 1);
      const h = canvas!.height / (window.devicePixelRatio || 1);
      if (!w || !h) return;

      ctx!.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.46;
      const ry = h * 0.42;

      // 三条轨道环
      for (let ring = 0; ring < 3; ring++) {
        const tiltX = ring * 0.5;
        const tiltY = ring * 0.35;
        const effectiveRx = rx * (1 - ring * 0.12);
        const effectiveRy = ry * (1 - ring * 0.12);

        // 画环线（虚线微光）
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, effectiveRx, effectiveRy, ring * 0.4, 0, Math.PI * 2);
        ctx!.strokeStyle = `${color}10`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();

        // 内环更亮
        if (ring === 0) {
          ctx!.beginPath();
          ctx!.ellipse(cx, cy, effectiveRx, effectiveRy, ring * 0.4, 0, Math.PI * 2);
          ctx!.strokeStyle = `${color}18`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // 粒子
      for (const p of particles) {
        p.angle += p.speed;
        if (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;

        const tilt = p.ringIndex * 0.4;
        const ringRx = rx * (1 - p.ringIndex * 0.12);
        const ringRy = ry * (1 - p.ringIndex * 0.12);

        const px = cx + Math.cos(p.angle) * ringRx * Math.cos(tilt);
        const py = cy + Math.sin(p.angle) * ringRy;

        // 粒子微光
        const twinkle = Math.sin(time * 0.003 + p.angle * 3) * 0.3 + 0.7;
        const alpha = p.alpha * twinkle;

        ctx!.beginPath();
        ctx!.arc(px, py, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx!.fill();

        // 较大粒子加辉光
        if (p.size > 1) {
          const glow = ctx!.createRadialGradient(px, py, 0, px, py, p.size * 3);
          glow.addColorStop(0, `${color}${Math.round(alpha * 100).toString(16).padStart(2, "0")}`);
          glow.addColorStop(1, "transparent");
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(px, py, p.size * 3, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function animate(t: number) {
      time = t;
      draw(t);
      animId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ position: "absolute", inset: "-10%", zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
