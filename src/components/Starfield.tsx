"use client";

import { useEffect, useRef, type RefObject } from "react";

/* ── 类型 ─────────────────────────────────── */

interface Star {
  x: number; y: number;
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

interface Nebula {
  hue: number;
  sat: number;
  light: number;
  alpha: number;
  radius: number;
  /** 当前锚点位置 0-1 */
  ax: number;
  ay: number;
  /** 目标锚点位置 */
  tax: number;
  tay: number;
  /** 平台颜色（hex） */
  color: string;
  /** 独立漂移相位 */
  phase: number;
  /** 独立速度 */
  speed: number;
  /** 轨道半径（归一化） */
  orbitR: number;
}

export interface CardAnchor {
  ref: RefObject<HTMLElement | null>;
  color: string;
}

/* ── 工具 ─────────────────────────────────── */

/** hex 转 HSL 分量 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const hc = hex.replace("#", "");
  if (hc.length === 3) {
    r = parseInt(hc[0] + hc[0], 16);
    g = parseInt(hc[1] + hc[1], 16);
    b = parseInt(hc[2] + hc[2], 16);
  } else {
    r = parseInt(hc.substring(0, 2), 16);
    g = parseInt(hc.substring(2, 4), 16);
    b = parseInt(hc.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/* ── 组件 ─────────────────────────────────── */

export default function Starfield({
  cardAnchors,
}: {
  cardAnchors?: CardAnchor[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let nebulaeData: Nebula[] = [];
    let W = 0, H = 0;
    let mx = -999, my = -999, tmx = -999, tmy = -999;
    let time = 0;
    let animId = 0;
    let hoveredIdx = -1;

    /* ── 初始化恒星 ──────────────────── */

    function initStars() {
      stars = [];
      for (let i = 0; i < 400; i++) makeStar(0);
      for (let i = 0; i < 250; i++) makeStar(1);
      for (let i = 0; i < 100; i++) makeStar(2);
      for (let i = 0; i < 40; i++) makeStar(3);
    }

    function makeStar(layer: number) {
      const t = Math.random();
      const inGalaxy = Math.random() < (layer <= 1 ? 0.7 : 0.45);
      let x: number, y: number;
      if (inGalaxy) {
        const arcY = 0.08 + Math.sin(t * Math.PI) * 0.2;
        const spread = 0.03 + Math.random() * 0.07 * (1 - Math.abs(t - 0.5) * 1.1);
        x = Math.random();
        y = arcY + (Math.random() - 0.5) * spread * 2.5;
      } else {
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
      stars.push({
        x, y, r, hue,
        sat: inGalaxy ? 30 : 12,
        light: 72 + layer * 8,
        alpha: aMap[layer] * (0.5 + Math.random() * 0.5),
        twinkleSpd: 0.0005 + Math.random() * 0.02,
        twinkleOff: Math.random() * Math.PI * 2,
        layer,
      });
    }

    /* ── 初始化星云（卡片锚点驱动） ── */

    function initNebulae(anchors?: CardAnchor[]) {
      nebulaeData = [];
      if (!anchors || anchors.length === 0) return;

      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const hsl = hexToHsl(a.color);
        nebulaeData.push({
          hue: hsl.h,
          sat: Math.min(90, hsl.s + 15),
          light: Math.min(60, hsl.l + 15),
          alpha: 0.018 + Math.random() * 0.012,
          radius: 0.28 + Math.random() * 0.12,
          ax: 0.5 + Math.random() * 0.1,
          ay: 0.48 + Math.random() * 0.06,
          tax: 0.5, tay: 0.5,
          color: a.color,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0001 + Math.random() * 0.00015,
          orbitR: 0.015 + Math.random() * 0.03,
        });
      }
    }

    /* ── 背景 ──────────────────────── */

    function bg() {
      ctx!.fillStyle = "#030712";
      ctx!.fillRect(0, 0, W, H);
      const v = ctx!.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      v.addColorStop(0, "transparent");
      v.addColorStop(1, "rgba(0, 0, 8, 0.55)");
      ctx!.fillStyle = v;
      ctx!.fillRect(0, 0, W, H);
    }

    /* ── 绘制锚点星云 ──────────────── */

    function drawNebulae() {
      if (!cardAnchors || cardAnchors.length === 0) return;

      for (let i = 0; i < nebulaeData.length; i++) {
        const n = nebulaeData[i];
        const anchor = cardAnchors[i];
        if (!anchor) continue;

        // 读取卡片实际位置
        const el = anchor.ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          n.tax = (rect.left + rect.width / 2) / W;
          n.tay = (rect.top + rect.height / 2) / H;
        }

        // 平滑逼近目标位置
        n.ax += (n.tax - n.ax) * 0.02;
        n.ay += (n.tay - n.ay) * 0.02;

        // 独立轨道漂移
        const orbX = Math.cos(time * n.speed + n.phase) * n.orbitR;
        const orbY = Math.sin(time * n.speed * 0.7 + n.phase + 1) * n.orbitR * 0.8;

        // 鼠标视差：星云微移向鼠标
        const pdx = mx > 0 ? (mx / W - 0.5) * 0.03 : 0;
        const pdy = my > 0 ? (my / H - 0.5) * 0.03 : 0;

        let px = (n.ax + orbX + pdx) * W;
        let py = (n.ay + orbY + pdy) * H;

        // 检测鼠标是否在卡片范围内 → 增亮
        const hovered = i === hoveredIdx;
        const aMul = hovered ? 2.2 : 1;
        const rMul = hovered ? 1.25 : 1;

        const rad = n.radius * Math.max(W, H) * rMul;

        const g = ctx!.createRadialGradient(px, py, rad * 0.01, px, py, rad);
        g.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.light}%, ${n.alpha * aMul})`);
        g.addColorStop(0.25, `hsla(${n.hue}, ${n.sat - 15}%, ${n.light * 0.75}%, ${n.alpha * 0.5 * aMul})`);
        g.addColorStop(0.6, `hsla(${n.hue}, ${n.sat - 25}%, ${n.light * 0.5}%, ${n.alpha * 0.12 * aMul})`);
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, W, H);
      }
    }

    /* ── 银河光弧 ──────────────────── */

    function galaxyArc() {
      const g = ctx!.createLinearGradient(0, 0, 0, H * 0.35);
      g.addColorStop(0, "rgba(80, 60, 140, 0.010)");
      g.addColorStop(0.5, "rgba(160, 130, 90, 0.008)");
      g.addColorStop(1, "transparent");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H * 0.35);

      for (let i = 0; i < 100; i++) {
        const t = Math.random();
        const py = (0.02 + Math.random() * 0.18) * H;
        const px = t * W;
        const r = 4 + Math.random() * 20;
        const a = 0.002 + Math.random() * 0.005;
        const grad = ctx!.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, `rgba(180, 155, 120, ${a})`);
        grad.addColorStop(1, "transparent");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      const g2 = ctx!.createLinearGradient(0, H * 0.70, 0, H);
      g2.addColorStop(0, "transparent");
      g2.addColorStop(0.6, "rgba(100, 80, 140, 0.008)");
      g2.addColorStop(1, "rgba(60, 40, 100, 0.014)");
      ctx!.fillStyle = g2;
      ctx!.fillRect(0, H * 0.70, W, H * 0.30);
    }

    /* ── 四角亮星团 ────────────────── */

    function cornerClusters() {
      const list = [
        { cx: 0.07, cy: 0.10, n: 50, sp: 0.06 },
        { cx: 0.93, cy: 0.08, n: 40, sp: 0.05 },
        { cx: 0.06, cy: 0.92, n: 45, sp: 0.055 },
        { cx: 0.94, cy: 0.91, n: 35, sp: 0.05 },
        { cx: 0.50, cy: 0.04, n: 40, sp: 0.07 },
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

    /* ── 恒星绘制 ──────────────────── */

    function drawStars() {
      const sorted = [...stars].sort((a, b) => a.layer - b.layer);
      for (const s of sorted) {
        let px = s.x * W;
        let py = s.y * H;
        if (s.layer >= 2) {
          const dx = px - mx, dy = py - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            const f = (1 - d / 160) * (s.layer - 1) * 0.6;
            s.x += (dx / d) * f * 0.0015;
            s.y += (dy / d) * f * 0.0015;
          }
        }
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

    /* ── 前景微闪 ──────────────────── */

    function sparkles() {
      for (let i = 0; i < 6; i++) {
        const px = ((time * 0.002 + i * 0.31) % 1) * W;
        const py = (Math.sin(i * 4.1 + time * 0.0004) * 0.35 + 0.5) * H;
        const phase = (time * 0.007 + i) % (Math.PI * 2);
        const a = Math.max(0, Math.sin(phase)) * 0.12;
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

    /* ── 事件处理 ──────────────────── */

    function onMove(e: MouseEvent) { tmx = e.clientX; tmy = e.clientY; }
    function onLeave() { tmx = -999; tmy = -999; }

    function onResize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      initStars();
      initNebulae(cardAnchors);
    }

    /* ── 卡片悬停检测 ─────────────── */

    function checkHover() {
      if (!cardAnchors) { hoveredIdx = -1; return; }
      hoveredIdx = -1;
      for (let i = cardAnchors.length - 1; i >= 0; i--) {
        const el = cardAnchors[i].ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (tmx >= rect.left && tmx <= rect.right && tmy >= rect.top && tmy <= rect.bottom) {
            hoveredIdx = i;
            break;
          }
        }
      }
    }

    /* ── 主循环 ────────────────────── */

    function animate(t: number) {
      time = t;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      checkHover();

      bg();
      drawNebulae();
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
      if (Math.random() < 0.3) spawnMeteor();
    }, 6000);

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      clearInterval(meteorTimer);
      cancelAnimationFrame(animId);
    };
  }, [cardAnchors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
