"use client";

import { useEffect, useState, useRef } from "react";

const MODES = [
  { id: "code",  label: "写代码", dot: "#8a5cff" },
  { id: "write", label: "写文章", dot: "#ff6ec7" },
  { id: "chill", label: "摸鱼",   dot: "#ffb45c" },
  { id: "night", label: "熬夜中", dot: "#5cc8ff" },
  { id: "away",  label: "away",   dot: "#8b90a8" },
];

const DEFAULT_DOING = "在深空漂浮中…";
const SITE_SINCE = "2026-08-04";

const autoMode = () => {
  const h = new Date().getHours();
  if (h >= 1 && h < 7) return "away";
  if (h >= 23) return "night";
  if (h >= 19) return "chill";
  return "code";
};

export default function NowCard() {
  const [modeId, setModeId] = useState("code");
  const [dayPct, setDayPct] = useState(0);
  const [doing, setDoing] = useState(DEFAULT_DOING);
  const [editing, setEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 初始化：从 API 拉公开状态 + 检测站长身份
  useEffect(() => {
    const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("gb-owner=1"));
    setIsOwner(hasCookie || localStorage.getItem("gb-is-owner") === "1");

    fetch("/api/now")
      .then((r) => r.json())
      .then((data) => {
        if (data.doing) setDoing(data.doing);
        if (data.mode && MODES.some((m) => m.id === data.mode)) setModeId(data.mode);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));

    const tick = () => {
      const n = new Date();
      const sec = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
      setDayPct(Number(((sec / 86400) * 100).toFixed(1)));
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const mode = MODES.find((m) => m.id === modeId) || MODES[0];
  const days = Math.max(0, Math.floor((Date.now() - new Date(SITE_SINCE).getTime()) / 864e5));
  const isNight = mode.id === "night";

  const saveToKV = (data: { doing?: string; mode?: string }) => {
    fetch("/api/now", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  const cycle = () => {
    if (editing) return;
    if (!isOwner) return; // 访客不能切
    const idx = MODES.findIndex((m) => m.id === mode.id);
    const next = MODES[(idx + 1) % MODES.length];
    setModeId(next.id);
    saveToKV({ mode: next.id });
  };

  const saveDoing = (val: string) => {
    const text = val.trim() || DEFAULT_DOING;
    setDoing(text);
    saveToKV({ doing: text });
    setEditing(false);
  };

  if (!loaded) {
    return (
      <div style={{ width: 256, height: 120, background: "rgba(22,16,50,0.30)", borderRadius: 16 }} />
    );
  }

  return (
    <button
      onClick={cycle}
      title={isOwner ? "点一下切状态，双击签名编辑" : "站长公开状态"}
      className="now-card group"
      style={{
        width: "256px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        textAlign: "left",
        background: "rgba(22,16,50,0.52)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        border: isNight
          ? "1px solid rgba(92,200,255,0.35)"
          : "1px solid rgba(255,255,255,0.16)",
        borderRadius: "16px",
        boxShadow: "0 16px 40px rgba(8,4,28,0.35)",
        cursor: isOwner ? "pointer" : "default",
        transition: "transform 0.25s, border-color 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = isNight
          ? "rgba(92,200,255,0.50)"
          : "rgba(255,255,255,0.30)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.borderColor = isNight
          ? "rgba(92,200,255,0.35)"
          : "rgba(255,255,255,0.16)";
      }}
    >
      {/* 第一行：呼吸点 + NOW + 状态 */}
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <i
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: mode.dot,
            boxShadow: `0 0 10px ${mode.dot}`,
            animation: "now-breathe 3s ease-in-out infinite",
            display: "inline-block",
          }}
        />
        <em style={{ fontStyle: "normal", fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.50)" }}>
          NOW
        </em>
        <b style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          {mode.label}
        </b>
        {isOwner && (
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>站长</span>
        )}
      </span>

      {/* 第二行：签名 */}
      {isOwner && editing ? (
        <input
          ref={inputRef}
          defaultValue={doing}
          onBlur={(e) => saveDoing(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveDoing(e.currentTarget.value);
            if (e.key === "Escape") setEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          maxLength={50}
          style={{
            fontSize: "14px",
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(200,180,240,0.30)",
            borderRadius: "8px",
            padding: "4px 8px",
            outline: "none",
            textShadow: "0 1px 10px rgba(16,8,40,0.50)",
          }}
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            if (!isOwner) return;
            e.stopPropagation();
            setEditing(true);
          }}
          style={{
            fontSize: "14px",
            color: "#fff",
            textShadow: "0 1px 10px rgba(16,8,40,0.50)",
            cursor: isOwner ? "text" : "default",
          }}
          title={isOwner ? "双击编辑签名" : undefined}
        >
          {doing}
        </span>
      )}

      {/* 第三行：进度条 + 建站天数 */}
      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <i
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "99px",
            background: "rgba(255,255,255,0.10)",
            overflow: "hidden",
            display: "block",
          }}
        >
          <u
            style={{
              display: "block",
              height: "100%",
              borderRadius: "99px",
              background: isNight
                ? "linear-gradient(90deg, #5cc8ff, #a78bfa, #c084fc)"
                : "linear-gradient(90deg, #8a5cff, #e87979, #f59e4b)",
              width: `${dayPct}%`,
              transition: "width 60s linear",
              boxShadow: isNight
                ? "0 0 6px rgba(92,200,255,0.25)"
                : "0 0 6px rgba(138,92,255,0.20)",
            }}
          />
        </i>
        <small
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          建站第 {days} 天
        </small>
      </span>

      <style>{`
        @keyframes now-breathe {
          50% { opacity: 0.5; }
        }
      `}</style>
    </button>
  );
}
