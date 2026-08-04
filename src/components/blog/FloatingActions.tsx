"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* 四张卡的细线图标（线宽与 HUD 环一致 ~1px） */
const CARD_ICONS: Record<string, React.ReactNode> = {
  posts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  guestbook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.7 0-3.2.7-4.3 1.8-1.1 1-1.7 2.3-1.7 3.7 0 2.8 2.2 5.5 6 8.5 3.8-3 6-5.7 6-8.5 0-1.4-.6-2.7-1.7-3.7C15.2 3.7 13.7 3 12 3z"/>
      <path d="M12 7v3l2 1.5" opacity="0.5"/>
    </svg>
  ),
  about: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  projects: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4h6V3z"/>
      <path d="M15 3h4a2 2 0 0 1 2 2v4h-6V3z"/>
      <path d="M9 13H3v6a2 2 0 0 0 2 2h4v-8z"/>
      <path d="M21 13h-6v8h4a2 2 0 0 0 2-2v-6z"/>
    </svg>
  ),
};

const actions = [
  { key: "posts", label: "文章", desc: "技术笔记" },
  { key: "guestbook", label: "留言", desc: "留言板" },
  { key: "about", label: "关于", desc: "关于我" },
  { key: "projects", label: "项目", desc: "航向主站" },
];

/* ====== 类型 ====== */
interface Reply {
  id: number;
  text: string;
  time: string;
}

interface Message {
  id: number;
  name: string;
  text: string;
  time: string;
  pinned?: boolean;
  likes?: number;
  avatar?: string;
  isOwner?: boolean;
  replies?: Reply[];
}

const AVATAR_COLORS = [
  "#ff6b8a","#ff9e6b","#6bc5ff","#a78bfa","#34d399",
  "#f472b6","#60a5fa","#fbbf24","#fb7185","#38bdf8",
  "#a3e635","#e879f9","#22d3ee","#f97316","#818cf8",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ====== 胶囊渐变按钮预设 ====== */
const BTN_GLASS_STYLE = (ops: number[]): React.CSSProperties => ({
  background: `linear-gradient(150deg, rgba(160,130,240,${ops[0]}), rgba(200,100,180,${ops[1]}), rgba(120,80,220,${ops[2]}), rgba(255,140,180,${ops[3]}))`,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(200,170,240,0.25)",
  boxShadow: [
    "inset 0 1px 0 rgba(255,255,255,0.30)",
    "inset 0 2px 6px rgba(255,255,255,0.06)",
    "inset 0 -2px 3px rgba(0,0,0,0.10)",
    "0 0 14px rgba(160,130,220,0.10)",
    "0 0 0 1px rgba(200,170,240,0.08)",
  ].join(", "),
});

/* ====== 留言板面板 ====== */
export function GuestbookPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [menuMsgId, setMenuMsgId] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [defaultName, setDefaultName] = useState("");
  const [bottleMsg, setBottleMsg] = useState<Message | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [myKeys, setMyKeys] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化
  useEffect(() => {
    fetchMessages();
    const saved = localStorage.getItem("gb-my-avatar");
    if (saved) setAvatarPreview(saved);

    // Cookie 优先（1年有效，清缓存不丢）
    const hasCookie = document.cookie.split("; ").some(r => r.startsWith("gb-owner=1"));
    if (hasCookie || localStorage.getItem("gb-is-owner") === "1") {
      setIsOwner(true);
      document.cookie = "gb-owner=1; max-age=31536000; path=/; SameSite=Lax";
      localStorage.setItem("gb-is-owner", "1");
    }
    if (window.location.search.includes("owner")) {
      document.cookie = "gb-owner=1; max-age=31536000; path=/; SameSite=Lax";
      localStorage.setItem("gb-is-owner", "1");
      setIsOwner(true);
      window.history.replaceState({}, "", window.location.pathname);
    }

    // 加载已保存的作者密钥
    try {
      const saved = JSON.parse(localStorage.getItem("gb-my-keys") || "{}");
      setMyKeys(new Set(Object.keys(saved).map(Number)));
    } catch {}
    fetch("/api/geo").then(r => r.json()).then(d => {
      if (d.location) setDefaultName(`来自${d.location}的路人`);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (menuMsgId === null) return;
    const close = () => setMenuMsgId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuMsgId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isOwner ? undefined : name.trim(),
          text: text.trim(),
          avatar: isOwner ? undefined : (avatarPreview || undefined),
          isOwner,
          honeypot: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      setMessages(prev => [data.message, ...prev]);
      // 保存 authorKey，用于后续自删
      if (data.authorKey) {
        const keys = JSON.parse(localStorage.getItem("gb-my-keys") || "{}");
        keys[data.message.id] = data.authorKey;
        localStorage.setItem("gb-my-keys", JSON.stringify(keys));
        setMyKeys(prev => new Set([...prev, data.message.id]));
      }
      setText(""); setName(""); setShowWrite(false);
      if (!isOwner) setAvatarPreview(null);
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally { setSending(false); }
  };

  const togglePin = async (id: number) => {
    try {
      const res = await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "pin", isOwner: true }) });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === id ? data.message : m));
      }
    } catch {}
  };

  const toggleLike = async (id: number) => {
    const wasLiked = likedIds.has(id);
    setLikedIds(prev => { const n = new Set(prev); wasLiked ? n.delete(id) : n.add(id); return n; });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: (m.likes ?? 0) + (wasLiked ? -1 : 1) } : m));
    try {
      const res = await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "like" }) });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === id ? data.message : m));
      }
    } catch {}
  };

  const submitReply = async (msgId: number) => {
    if (!replyText.trim() || replying) return;
    setReplying(true);
    try {
      const res = await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msgId, action: "reply", text: replyText.trim(), isOwner: true }) });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === msgId ? data.message : m));
        setReplyId(null); setReplyText("");
      }
    } catch {} finally { setReplying(false); }
  };

  const deleteMsg = async (id: number) => {
    await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "delete", isOwner: true }) });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const deleteSelf = async (id: number) => {
    const keys = JSON.parse(localStorage.getItem("gb-my-keys") || "{}");
    const authorKey = keys[id];
    if (!authorKey) return;
    await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "delete-self", authorKey }) });
    setMessages(prev => prev.filter(m => m.id !== id));
    delete keys[id];
    localStorage.setItem("gb-my-keys", JSON.stringify(keys));
    setMyKeys(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const fetchBottle = async () => {
    try {
      const res = await fetch("/api/guestbook", { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setBottleMsg(data.message);
      }
    } catch {}
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 120; canvas.height = 120;
      canvas.getContext("2d")!.drawImage(img, sx, sy, size, size, 0, 0, 120, 120);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setAvatarPreview(dataUrl);
      localStorage.setItem("gb-my-avatar", dataUrl);
    };
    img.src = URL.createObjectURL(file);
  };

  /* ====== 渲染留言卡片 ====== */
  const renderMessage = (msg: Message) => {
    const avColor = avatarColor(msg.name);
    const isPinned = msg.pinned;
    return (
      <div key={msg.id}
        className="relative rounded-[13px] px-3.5 py-2.5 transition-all duration-300 overflow-hidden
                   hover:scale-[1.01] hover:-translate-y-0.5"
        style={{
          background: msg.isOwner
            ? "linear-gradient(135deg, rgba(40,50,180,0.72), rgba(120,60,180,0.72), rgba(200,50,130,0.72))"
            : "linear-gradient(135deg, rgba(25,20,48,0.62), rgba(30,22,50,0.60))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: msg.isOwner ? "1px solid rgba(200,170,240,0.35)" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: msg.isOwner ? "0 0 20px rgba(100,50,200,0.22)" : "0 4px 20px rgba(0,0,0,0.12)",
        }}
      >
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-4 right-4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(200,160,230,0.4), rgba(255,150,190,0.3), transparent)" }} />

        {/* 置顶 / 博主徽章 */}
        <div className="flex items-center gap-2 mb-2">
          {isPinned && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300/80 border border-amber-400/20">📌 房东精选</span>
          )}
          {msg.isOwner && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-400/15 text-pink-300/80 border border-pink-400/20">👑 博主</span>
          )}
        </div>

        {/* 自删按钮（非站长的自己留言） */}
        {!msg.isOwner && myKeys.has(msg.id) && (
          <div className="absolute top-2 right-2 z-20">
            <button onClick={(e) => { e.stopPropagation(); deleteSelf(msg.id); }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/20 hover:text-red-300/70 hover:bg-red-400/10 transition-all text-xs"
              title="删除我的留言">
              ✕
            </button>
          </div>
        )}

        {/* 站长菜单 */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-20">
            <button onClick={(e) => { e.stopPropagation(); setMenuMsgId(menuMsgId === msg.id ? null : msg.id); }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all text-sm">
              ⋯
            </button>
            {menuMsgId === msg.id && (
              <div className="absolute right-0 top-8 rounded-lg py-1 z-30 min-w-[100px]"
                style={{ background: "rgba(25,20,50,0.94)", backdropFilter: "blur(14px)", border: "1px solid rgba(200,180,230,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { togglePin(msg.id); setMenuMsgId(null); }}
                  className="w-full text-left px-3.5 py-2 text-[11px] text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-colors">
                  {isPinned ? "📌 取消置顶" : "📌 房东精选"}
                </button>
                <button onClick={() => { setReplyId(msg.id); setMenuMsgId(null); }}
                  className="w-full text-left px-3.5 py-2 text-[11px] text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-colors">
                  💬 回复
                </button>
                <button onClick={() => { deleteMsg(msg.id); setMenuMsgId(null); }}
                  className="w-full text-left px-3.5 py-2 text-[11px] text-red-300/60 hover:text-red-300/90 hover:bg-white/[0.06] transition-colors">
                  🗑 删除
                </button>
              </div>
            )}
          </div>
        )}

        {/* 头像 + 信息 */}
        <div className="flex items-center gap-3 mt-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white select-none ring-2 ring-white/10 overflow-hidden"
            style={{
              background: msg.avatar
                ? `url(${msg.avatar}) center/cover`
                : msg.isOwner ? "none" : `linear-gradient(135deg, ${avColor}, ${avColor}dd)`,
              boxShadow: msg.isOwner ? "0 0 10px rgba(251,191,36,0.3)" : "none",
            }}>
            {msg.avatar ? null : msg.isOwner ? (
              <img src="/assets/images/avatar.png" alt="" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="20" cy="14" r="9" fill="rgba(255,255,255,0.25)"/>
                <ellipse cx="20" cy="36" rx="14" ry="8" fill="rgba(255,255,255,0.12)"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[12px] text-white/90 font-medium block truncate">{msg.name}</span>
          </div>
        </div>

        {/* 正文 */}
        <p className="text-[13px] text-white/80 leading-relaxed mt-2 ml-12"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{msg.text}</p>

        {/* 点赞 + 时间（右下角） */}
        <div className="flex items-center justify-end gap-3 mt-2 ml-12">
          <button onClick={(e) => { e.stopPropagation(); toggleLike(msg.id); }}
            className="flex items-center gap-1.5 transition-all duration-200 hover:scale-110 active:scale-75">
            <span className="text-sm select-none"
              style={{ filter: likedIds.has(msg.id) ? "drop-shadow(0 0 5px rgba(255,80,120,0.5))" : "grayscale(1)", opacity: likedIds.has(msg.id) ? 1 : 0.3 }}>
              ❤️
            </span>
          </button>
          {(msg.likes ?? 0) > 0 && <span className="text-[10px] tabular-nums font-medium"
            style={{ color: "rgba(255,255,255,0.60)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{msg.likes}</span>}
          <span className="text-[9px]"
            style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{msg.time}</span>
        </div>

        {/* 博主回复线程 */}
        {msg.replies && msg.replies.length > 0 && (
          <div className="mt-2 ml-10 space-y-1.5">
            {msg.replies.map(r => (
              <div key={r.id} className="rounded-lg px-3 py-2"
                style={{ background: "rgba(40,50,180,0.25)", border: "1px solid rgba(150,160,240,0.2)", borderLeft: "2px solid rgba(200,170,240,0.5)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <img src="/assets/images/avatar.png" alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-[10px] text-white/70 font-medium">站长</span>
                  <span className="text-[8px] text-white/25">{r.time}</span>
                </div>
                <p className="text-[11px] text-white/55 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 回复输入框 */}
        {isOwner && replyId === msg.id && (
          <div className="mt-2 ml-10 flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="回复..." maxLength={300}
              className="flex-1 rounded-lg px-3 py-1.5 text-[11px] text-white/80 placeholder:text-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,170,240,0.2)" }} />
            <button onClick={() => submitReply(msg.id)} disabled={replying}
              className="text-[10px] px-3 py-1.5 rounded-lg text-white/80 bg-pink-400/20 hover:bg-pink-400/30 transition-colors disabled:opacity-30">
              {replying ? "..." : "回复"}
            </button>
            <button onClick={() => setReplyId(null)}
              className="text-[10px] px-2 py-1.5 rounded-lg text-white/30 hover:text-white/50">✕</button>
          </div>
        )}
      </div>
    );
  };

  /* ====== 星点装饰（空状态） ====== */
  const StarDust = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[18px]">
      {Array.from({ length: 20 }).map((_, i) => {
        const cx = 10 + Math.random() * 80;
        const cy = 10 + Math.random() * 80;
        const r = 0.3 + Math.random() * 1.2;
        const delay = Math.random() * 3;
        return (
          <div key={i}
            className="absolute rounded-full"
            style={{
              left: `${cx}%`, top: `${cy}%`,
              width: `${r * 2}px`, height: `${r * 2}px`,
              background: i % 3 === 0 ? "rgba(255,180,220,0.5)" : i % 3 === 1 ? "rgba(180,160,240,0.45)" : "rgba(150,210,240,0.4)",
              boxShadow: `0 0 ${r * 3}px currentColor`,
              animation: `star-twinkle ${2 + delay}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );

  /* ====== 主渲染 ====== */
  return (
    <div className="w-full max-w-3xl mx-auto rounded-[18px] p-5 md:p-6 flex flex-col relative"
      style={{
        background: "rgba(20,18,45,0.45)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(220,200,245,0.45)",
        boxShadow: "0 0 30px rgba(160,140,220,0.06)",
        minHeight: messages.length === 0 && !loading ? "300px" : "auto",
        maxHeight: "700px",
      }}>

      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h4 className="text-sm text-white/55 tracking-[0.12em]"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
          💬 留言板
          {messages.length > 0 && <span className="ml-2 text-white/25">{messages.length}</span>}
        </h4>
        <button onClick={fetchBottle} title="捞漂流瓶"
          className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] hover:text-white/65 hover:bg-white/[0.12] transition-all"
          style={{ color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          🍾 捞瓶
        </button>
      </div>

      {/* 漂流瓶 */}
      {bottleMsg && (
        <div className="mb-4 rounded-xl p-3 relative shrink-0"
          style={{ background: "rgba(100,140,220,0.15)", border: "1px solid rgba(150,180,240,0.25)" }}>
          <button onClick={() => setBottleMsg(null)} className="absolute top-1 right-2 text-white/20 hover:text-white/50 text-xs">✕</button>
          <p className="text-[9px] text-white/35 mb-1">🍾 你捞到了一条留言：</p>
          <p className="text-[11px] text-white/65 leading-relaxed line-clamp-4"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{bottleMsg.text}</p>
          <p className="text-[9px] text-white/30 mt-1">{bottleMsg.name} · {bottleMsg.time}</p>
        </div>
      )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full"><span className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.40)" }}>加载中...</span></div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center relative">
                  {/* 空状态星点装饰 */}
                  <StarDust />
                  {/* 漂流瓶剪影 */}
                  <div className="relative z-10 mb-3 opacity-25"
                    style={{ filter: "drop-shadow(0 0 12px rgba(180,160,240,0.4))" }}>
                    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                      {/* 瓶身 */}
                      <path d="M16 14 L16 44 Q16 50 24 50 Q32 50 32 44 L32 14 Z"
                        stroke="rgba(200,180,240,0.8)" strokeWidth="1.5" fill="none" />
                      {/* 瓶颈 */}
                      <path d="M18 14 L18 6 Q18 2 24 2 Q30 2 30 6 L30 14"
                        stroke="rgba(200,180,240,0.8)" strokeWidth="1.5" fill="none" />
                      {/* 瓶塞 */}
                      <rect x="19" y="0" width="10" height="4" rx="2"
                        fill="rgba(200,180,240,0.5)" />
                      {/* 瓶中信纸 */}
                      <rect x="20" y="20" width="8" height="14" rx="1"
                        fill="rgba(255,220,240,0.15)" />
                      {/* 星点 */}
                      <circle cx="28" cy="28" r="1" fill="rgba(255,255,255,0.4)" />
                      <circle cx="22" cy="34" r="0.7" fill="rgba(255,255,255,0.3)" />
                    </svg>
                  </div>
                  <p className="text-xs relative z-10 mb-1"
                    style={{ color: "rgba(255,255,255,0.40)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                    还没有留言
                  </p>
                  <p className="text-[11px] relative z-10"
                    style={{ color: "rgba(255,255,255,0.40)", textShadow: "0 1px 3px rgba(0,0,0,0.4)", fontStyle: "italic" }}>
                    把你的星语装进漂流瓶，掷向深空
                  </p>
                  {/* 底部飘浮星点 */}
                  <div className="flex gap-5 mt-4 relative z-10 opacity-30">
                    <span className="text-[9px] animate-pulse" style={{ animationDelay: "0s", color: "rgba(200,180,240,0.6)" }}>✦</span>
                    <span className="text-[7px] animate-pulse" style={{ animationDelay: "0.6s", color: "rgba(255,180,210,0.5)" }}>✦</span>
                    <span className="text-[9px] animate-pulse" style={{ animationDelay: "1.2s", color: "rgba(180,210,240,0.5)" }}>✦</span>
                    <span className="text-[7px] animate-pulse" style={{ animationDelay: "1.8s", color: "rgba(220,180,240,0.5)" }}>✦</span>
                  </div>
                </div>
              ) : (
                messages.map(m => renderMessage(m))
              )}
            </>
          )}
        </div>

      {/* ====== 写留言按钮 + 表单（留言列表下方） ====== */}
      <div className="shrink-0 mt-3">
        {!showWrite && (
          <button onClick={() => setShowWrite(true)}
            className="w-full py-2 rounded-[12px] text-xs font-medium tracking-wider transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.40)",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              e.currentTarget.style.borderColor = "rgba(200,170,240,0.35)";
              e.currentTarget.style.background = "rgba(200,170,240,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.40)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}>
            ✏️ 写留言
          </button>
        )}

        {showWrite && (
          <div className="mt-3 rounded-[14px] p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,180,240,0.18)" }}>
            {isOwner ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full shrink-0 ring-2 ring-amber-400/30 overflow-hidden"
                    style={{ boxShadow: "0 0 10px rgba(251,191,36,0.2)" }}>
                    <img src="/assets/images/avatar.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">站长</span>
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="写下你想说的话..." rows={3} maxLength={500}
                  className="w-full rounded-[12px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
                {error && <p className="text-[11px] text-amber-300/60">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setShowWrite(false)}
                    className="px-3 py-2 rounded-[12px] text-xs text-white/40 hover:text-white/60 transition-colors">
                    收起
                  </button>
                  <button onClick={submit} disabled={!text.trim() || sending}
                    className="flex-1 py-2 rounded-[12px] text-xs font-medium tracking-wider transition-all disabled:opacity-30 hover:brightness-110"
                    style={sending
                      ? { ...BTN_GLASS_STYLE([0.25,0.20,0.18,0.15]), color: "rgba(255,255,255,0.60)" }
                      : { ...BTN_GLASS_STYLE([0.55,0.42,0.35,0.30]), color: "rgba(255,255,255,0.95)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }
                    }>
                    {sending ? "发送中..." : "发送留言"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all hover:scale-105 border-2 border-dashed border-white/15"
                    style={{ background: avatarPreview ? `url(${avatarPreview}) center/cover` : "rgba(255,255,255,0.06)" }}>
                    {!avatarPreview && <span className="text-white/25 text-base">+</span>}
                  </div>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder={defaultName || "你的名字（选填）"} maxLength={20}
                    className="flex-1 rounded-[12px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="说点什么..." rows={3} maxLength={500}
                  className="w-full rounded-[12px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
                {error && <p className="text-[11px] text-red-300/60">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setText(""); setName(""); setError(""); setAvatarPreview(null); setShowWrite(false); }}
                    className="px-3 py-2 rounded-[12px] text-xs text-white/40 hover:text-white/60 transition-colors">
                    收起
                  </button>
                  <button onClick={submit} disabled={!text.trim() || sending}
                    className="flex-1 py-2 rounded-[12px] text-xs font-medium tracking-wider transition-all disabled:opacity-30 hover:brightness-110"
                    style={sending
                      ? { ...BTN_GLASS_STYLE([0.25,0.20,0.18,0.15]), color: "rgba(255,255,255,0.60)" }
                      : { ...BTN_GLASS_STYLE([0.55,0.42,0.35,0.30]), color: "rgba(255,255,255,0.95)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }
                    }>
                    {sending ? "..." : "发送留言"}
                  </button>
                </div>
                <p className="text-[9px] text-center"
                  style={{ color: "rgba(255,255,255,0.45)", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>每人每天最多 5 条留言</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== 主组件 ====== */
const panels: Record<string, { title: string; href: string }> = {
  posts: { title: "文章", href: "/blog" },
  guestbook: { title: "留言板", href: "" },
  about: { title: "关于", href: "/blog/about" },
  projects: { title: "项目", href: "https://starrynova.cc" },
};

export default function FloatingActions() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const panel = panels[active];
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-10 anime-glow"
          style={{
            width: "calc(100vw - 20px)", maxWidth: "960px", minHeight: "auto",
            /* 外轻：外层大面板轻透玻璃 */
            background: "rgba(20,16,42,0.32)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(200,180,230,0.40)",
            boxShadow: "0 0 60px rgba(160,130,220,0.08), 0 0 0 1px rgba(200,180,230,0.04)",
          }}>
          <div className="flex items-center justify-end mb-4 md:mb-6">
            <button onClick={() => setActive(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}>
              ✕
            </button>
          </div>
          {active === "guestbook" ? <GuestbookPanel /> : (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-white/30 tracking-wider mb-4">{panel.title}内容即将上线</p>
              {panel.href && <Link href={panel.href} className="text-[11px] text-amber-200/50 hover:text-amber-200/80 tracking-[0.1em] transition-colors">前往 {panel.title} →</Link>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6 px-4 md:px-0">
      {actions.map(({ key, label, desc }) => (
        <button key={key} onClick={() => setActive(key)}
          className="w-full md:w-40 aspect-square md:h-40 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-2 md:gap-2.5 cursor-pointer group"
          style={{
            background: "rgba(15,12,35,0.45)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(200,180,230,0.25)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px) scale(1.04)";
            e.currentTarget.style.borderColor = "rgba(210,185,245,0.55)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18), 0 0 28px rgba(180,150,220,0.16), 0 0 0 1px rgba(200,170,240,0.08)";
            e.currentTarget.style.background = "rgba(22,16,44,0.58)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.borderColor = "rgba(200,180,230,0.25)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
            e.currentTarget.style.background = "rgba(15,12,35,0.45)";
          }}>
          {/* 细线图标 — 默认安静 */}
          <div className="text-white/20 group-hover:text-white/50 transition-colors duration-300"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
            {CARD_ICONS[key]}
          </div>
          <span className="text-sm md:text-base font-semibold tracking-[0.12em] text-white/85 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">{label}</span>
          <span className="text-[10px] text-white/35 tracking-wider drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{desc}</span>
        </button>
      ))}
    </div>
  );
}
