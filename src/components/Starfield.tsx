"use client";

import { useEffect, useRef } from "react";

/* ── 类型 ─────────────────────────────────── */

interface Star {
  x: number; y: number;    // 0~1 归一化
  r: number; hue: number;
  sat: number; light: number;
  alpha: number;
  twinkleSpd: number;
  twinkleOff: number;
  layer: number;
}

interface Meteor {
  x: number; y: number;
  dx: number; dy: number;
  life: number; maxLife: number;
  len: number;
}

/* ── 组件 ─────────────────────────────────── */

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let W = 0, H = 0;
    let mx = -999, my = -999, tmx = -999, tmy = -999;
    let time = 0;
    let animId = 0;

    /* ── 恒星 ──────────────────────── */

    function init() {
      stars = [];
      for (let i = 0; i < 700; i++) makeStar(0);  // 远景微星
      for (let i = 0; i < 450; i++) makeStar(1);  // 中景
      for (let i = 0; i < 200; i++) makeStar(2);  // 亮星
      for (let i = 0; i < 80; i++) makeStar(3);   // 巨星
    }

    function makeStar(layer: number) {
      // 银河弧线在上半区，从左上跨到右上，避开中央卡片区
      const t = Math.random();
      const inGalaxy = Math.random() < (layer <= 1 ? 0.7 : 0.45);

      let x: number, y: number;

      if (inGalaxy) {
        // 银河带：从左到右弧形，峰值在 y≈0.15~0.25（屏幕上方）
        const arcY = 0.08 + Math.sin(t * Math.PI) * 0.2;
        const spread = 0.03 + Math.random() * 0.07 * (1 - Math.abs(t - 0.5) * 1.1);
        x = Math.random();
        y = arcY + (Math.random() - 0.5) * spread * 2.5;
      } else {
        // 非银河星：分布在全屏但四角密度更高
        const corner = Math.floor(Math.random() * 4);
        const cx = [0.12, 0.88, 0.12, 0.88][corner];
        const cy = [0.12, 0.12, 0.88, 0.88][corner];
        x = cx + (Math.random() - 0.5) * 0.35;
        y = cy + (Math.random() - 0.5) * 0.35;
      }

      const hue = inGalaxy ? 30 + Math.random() * 20 : 200 + Math.random() * 55;
      const rMap = [0.12, 0.35, 0.75, 1.8];
      const r = rMap[layer] * (0.4 + Math.random() * 0.8);
      const aMap = [0.35, 0.55, 0.75, 0.92];
      const alpha = aMap[layer] * (0.5 + Math.random() * 0.5);

      stars.push({
        x, y, r, hue,
        sat: inGalaxy ? 30 : 12,
        light: 72 + layer * 8,
        alpha,
        twinkleSpd: 0.0005 + Math.random() * 0.02,
        twinkleOff: Math.random() * Math.PI * 2,
        layer,
      });
    }

    /* ── 背景 ──────────────────────── */

    function bg() {
      ctx!.fillStyle = "#010308";
      ctx!.fillRect(0, 0, W, H);

      // 边缘暗角——增强四角深度
      const v = ctx!.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      v.addColorStop(0, "transparent");
      v.addColorStop(1, "rgba(0, 0, 8, 0.55)");
      ctx!.fillStyle = v;
      ctx!.fillRect(0, 0, W, H);
    }

    /* ── 四角星云 ─────────────────── */

    function nebulae() {
      // 所有星云都布置在四角和边缘，避开中央卡片区 (0.15~0.85 x, 0.12~0.88 y)
      const list = [
        // 左上角：蓝紫星云群
        { cx: 0.08, cy: 0.10, r: 0.38, h: 245, s: 85, a: 0.025 },
        { cx: 0.14, cy: 0.06, r: 0.28, h: 265, s: 75, a: 0.020 },
        // 右上角：粉红+金色星云
        { cx: 0.92, cy: 0.08, r: 0.35, h: 340, s: 78, a: 0.024 },
        { cx: 0.86, cy: 0.12, r: 0.26, h: 30, s: 70, a: 0.018 },
        // 左下角：青色+紫色
        { cx: 0.07, cy: 0.92, r: 0.36, h: 210, s: 80, a: 0.023 },
        { cx: 0.12, cy: 0.88, r: 0.27, h: 280, s: 65, a: 0.017 },
        // 右下角：暖金+粉
        { cx: 0.93, cy: 0.90, r: 0.34, h: 40, s: 75, a: 0.022 },
        { cx: 0.88, cy: 0.94, r: 0.25, h: 330, s: 60, a: 0.016 },
        // 顶部中央偏上（卡片上方可见）
        { cx: 0.50, cy: 0.03, r: 0.30, h: 290, s: 70, a: 0.020 },
        { cx: 0.35, cy: 0.05, r: 0.22, h: 230, s: 65, a: 0.015 },
        { cx: 0.65, cy: 0.04, r: 0.22, h: 350, s: 60, a: 0.015 },
        // 底部中央偏下（卡片下方可见）
        { cx: 0.48, cy: 0.97, r: 0.28, h: 260, s: 68, a: 0.018 },
        { cx: 0.55, cy: 0.95, r: 0.22, h: 200, s: 62, a: 0.014 },
      ];

      for (const n of list) {
        const dx = Math.sin(time * 0.00012 + n.h * 0.07) * W * 0.02;
        const dy = Math.cos(time * 0.00018 + n.h * 0.07) * H * 0.02;
        const px = n.cx * W + dx;
        const py = n.cy * H + dy;
        const rad = n.r * Math.max(W, H);

        const g = ctx!.createRadialGradient(px, py, rad * 0.01, px, py, rad);
        g.addColorStop(0, `hsla(${n.h}, ${n.s}%, 65%, ${n.a})`);
        g.addColorStop(0.25, `hsla(${n.h}, ${n.s - 15}%, 48%, ${n.a * 0.5})`);
        g.addColorStop(0.6, `hsla(${n.h}, ${n.s - 25}%, 30%, ${n.a * 0.12})`);
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, W, H);
      }
    }

    /* ── 银河光弧（屏幕上方，卡片挡不到） ─ */

    function galaxyArc() {
      // 银河从左上角弧线跨到右上角，经过顶部
      const g = ctx!.createLinearGradient(0, 0, 0, H * 0.35);
      g.addColorStop(0, "rgba(80, 60, 140, 0.015)");
      g.addColorStop(0.5, "rgba(160, 130, 90, 0.012)");
      g.addColorStop(1, "transparent");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H * 0.35);

      // 银河雾粒子——只在顶部区域
      for (let i = 0; i < 200; i++) {
        const t = Math.random();
        const py = (0.02 + Math.random() * 0.18) * H;
        const px = t * W;
        const r = 4 + Math.random() * 20;
        const a = 0.003 + Math.random() * 0.006;

        const grad = ctx!.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, `rgba(180, 155, 120, ${a})`);
        grad.addColorStop(1, "transparent");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 底部也有微弱的银河延伸
      const g2 = ctx!.createLinearGradient(0, H * 0.70, 0, H);
      g2.addColorStop(0, "transparent");
      g2.addColorStop(0.6, "rgba(100, 80, 140, 0.010)");
      g2.addColorStop(1, "rgba(60, 40, 100, 0.018)");
      ctx!.fillStyle = g2;
      ctx!.fillRect(0, H * 0.70, W, H * 0.30);
    }

    /* ── 四角亮星团 ───────────────── */

    function cornerClusters() {
      const list = [
        { cx: 0.07, cy: 0.10, n: 80, sp: 0.06 },
        { cx: 0.93, cy: 0.08, n: 70, sp: 0.05 },
        { cx: 0.06, cy: 0.92, n: 75, sp: 0.055 },
        { cx: 0.94, cy: 0.91, n: 65, sp: 0.05 },
        { cx: 0.50, cy: 0.04, n: 60, sp: 0.07 },
      ];

      for (const cl of list) {
        for (let i = 0; i < cl.n; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * cl.sp;
          const px = (cl.cx + Math.cos(ang) * dist) * W;
          const py = (cl.cy + Math.sin(ang) * dist) * H;
          const r = 0.08 + Math.random() * 0.3;
          const tw = Math.sin(time * 0.004 + i) * 0.3 + 0.7;
          const a = (0.12 + Math.random() * 0.22) * tw;

          ctx!.beginPath();
          ctx!.arc(px, py, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(190, 200, 240, ${a})`;
          ctx!.fill();
        }
      }
    }

    /* ── 恒星绘制 ─────────────────── */

    function drawStars() {
      const sorted = [...stars].sort((a, b) => a.layer - b.layer);

      for (const s of sorted) {
        let px = s.x * W;
        let py = s.y * H;

        // 鼠标引力
        if (s.layer >= 2) {
          const dx = px - mx, dy = py - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            const f = (1 - d / 160) * (s.layer - 1) * 0.6;
            s.x += (dx / d) * f * 0.0015;
            s.y += (dy / d) * f * 0.0015;
          }
        }

        // 微漂移
        s.x += Math.sin(time * 0.0002 + s.twinkleOff) * 0.000015 * (s.layer + 1);
        s.y -= 0.00002 * (s.layer + 1);
        if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
        if (s.x < -0.02) s.x = 1.02;
        if (s.x > 1.02) s.x = -0.02;
        if (s.y > 1.02) { s.y = -0.02; s.x = Math.random(); }

        px = s.x * W;
        py = s.y * H;

        const tw = Math.sin(time * s.twinkleSpd + s.twinkleOff) * 0.3 + 0.7;
        const a = Math.min(1, s.alpha * tw);
        if (a < 0.02) continue;

        ctx!.beginPath();
        ctx!.arc(px, py, Math.max(0.1, s.r), 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${a})`;
        ctx!.fill();

        // 亮星辉光
        if (s.layer >= 2 && a > 0.5) {
          const gr = s.r * 3.5;
          const glow = ctx!.createRadialGradient(px, py, s.r * 0.5, px, py, gr);
          glow.addColorStop(0, `hsla(${s.hue}, 20%, 95%, ${a * 0.35})`);
          glow.addColorStop(1, "transparent");
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(px, py, gr, 0, Math.PI * 2);
          ctx!.fill();
        }

        // 巨星十字芒
        if (s.layer === 3 && a > 0.6) {
          const L = s.r * 5;
          const la = a * 0.2;
          ctx!.strokeStyle = `hsla(${s.hue}, 15%, 95%, ${la})`;
          ctx!.lineWidth = 0.3;
          ctx!.beginPath();
          ctx!.moveTo(px - L, py); ctx!.lineTo(px + L, py);
          ctx!.moveTo(px, py - L); ctx!.lineTo(px, py + L);
          ctx!.stroke();
        }
      }
    }

    /* ── 流星 ──────────────────────── */

    function spawnMeteor() {
      const left = Math.random() > 0.5;
      const ang = left ? -0.3 + Math.random() * 0.6 : Math.PI - 0.3 - Math.random() * 0.6;
      const spd = 5 + Math.random() * 9;
      meteors.push({
        x: left ? -30 : W + 30,
        y: Math.random() * H * 0.45,
        dx: Math.cos(ang) * spd,
        dy: Math.sin(ang) * spd,
        life: 0,
        maxLife: 30 + Math.random() * 50,
        len: 60 + Math.random() * 160,
      });
    }

    function drawMeteors() {
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        const p = m.life / m.maxLife;
        const a = p < 0.07 ? p / 0.07 : p > 0.5 ? 1 - (p - 0.5) / 0.5 : 1;

        const tx = m.x - m.dx * m.len;
        const ty = m.y - m.dy * m.len;

        const gg = ctx!.createLinearGradient(m.x, m.y, tx, ty);
        gg.addColorStop(0, `rgba(255, 255, 255, ${a})`);
        gg.addColorStop(0.03, `rgba(180, 210, 255, ${a * 0.85})`);
        gg.addColorStop(0.2, `rgba(100, 150, 220, ${a * 0.2})`);
        gg.addColorStop(1, "transparent");

        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tx, ty);
        ctx!.strokeStyle = gg;
        ctx!.lineWidth = 2.5;
        ctx!.stroke();

        ctx!.lineWidth = 0.5;
        ctx!.strokeStyle = `rgba(255, 255, 255, ${a * 0.9})`;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx!.fill();

        m.x += m.dx;
        m.y += m.dy;

        if (m.life >= m.maxLife || m.x < -200 || m.x > W + 200 || m.y > H + 200) {
          meteors.splice(i, 1);
        }
      }
    }

    /* ── 前景微闪 ─────────────────── */

    function sparkles() {
      for (let i = 0; i < 12; i++) {
        const px = ((time * 0.002 + i * 0.31) % 1) * W;
        const py = (Math.sin(i * 4.1 + time * 0.0004) * 0.35 + 0.5) * H;
        const phase = (time * 0.007 + i) % (Math.PI * 2);
        const a = Math.max(0, Math.sin(phase)) * 0.22;

        if (a > 0.015) {
          const g = ctx!.createRadialGradient(px, py, 0, px, py, 10);
          g.addColorStop(0, `rgba(180, 210, 255, ${a})`);
          g.addColorStop(1, "transparent");
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(px, py, 10, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    /* ── 卡片区域微弱光晕（不抢戏） ─ */

    function cardAmbientGlow() {
      // 三列卡片大致位置：左 0.18，中 0.5，右 0.82
      const positions = [0.18, 0.50, 0.82];
      const colors = ["230, 22, 45", "0, 102, 255", "251, 114, 153"];

      for (let i = 0; i < 3; i++) {
        const cx = positions[i] * W;
        const cy = H * 0.48;
        const g = ctx!.createRadialGradient(cx, cy, H * 0.05, cx, cy, H * 0.35);
        g.addColorStop(0, `rgba(${colors[i]}, 0.03)`);
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.fillRect(cx - H * 0.35, cy - H * 0.35, H * 0.7, H * 0.7);
      }
    }

    /* ── 事件 ──────────────────────── */

    function onMove(e: MouseEvent) { tmx = e.clientX; tmy = e.clientY; }
    function onLeave() { tmx = -999; tmy = -999; }

    function onResize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      init();
    }

    /* ── 主循环 ────────────────────── */

    function animate(t: number) {
      time = t;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      bg();
      cardAmbientGlow();
      nebulae();
      galaxyArc();
      cornerClusters();
      drawStars();
      drawMeteors();
      sparkles();

      animId = requestAnimationFrame(animate);
    }

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const meteorTimer = setInterval(() => {
      if (Math.random() < 0.5) spawnMeteor();
    }, 3500);
    spawnMeteor();
    spawnMeteor();

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      clearInterval(meteorTimer);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0, background: "#010308" }}
      aria-hidden="true"
    />
  );
}
