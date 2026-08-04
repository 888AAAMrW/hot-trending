"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

/* ====== 留言板面板 ====== */
function GuestbookPanel() {
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
  const [defaultName, setDefaultName] = useState("");
  const [bottleMsg, setBottleMsg] = useState<Message | null>(null);
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
      // 双写：Cookie + localStorage 互相备份
      document.cookie = "gb-owner=1; max-age=31536000; path=/; SameSite=Lax";
      localStorage.setItem("gb-is-owner", "1");
    }
    // 新设备激活：访问 ?owner （一次性）
    if (window.location.search.includes("owner")) {
      document.cookie = "gb-owner=1; max-age=31536000; path=/; SameSite=Lax";
      localStorage.setItem("gb-is-owner", "1");
      setIsOwner(true);
      window.history.replaceState({}, "", window.location.pathname);
    }

    // 获取 IP 定位
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

  // 拉取留言
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

  // 发留言
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
          honeypot: "",  // 蜜罐：机器人会自动填写
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");

      setMessages(prev => [data.message, ...prev]);
      setText(""); setName("");
      if (!isOwner) setAvatarPreview(null);
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally { setSending(false); }
  };

  // 置顶
  const togglePin = async (id: number) => {
    try {
      const res = await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "pin", isOwner: true }) });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === id ? data.message : m));
      }
    } catch {}
  };

  // 点赞
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

  // 回复
  const submitReply = async (msgId: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msgId, action: "reply", text: replyText.trim(), isOwner: true }) });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === msgId ? data.message : m));
        setReplyId(null); setReplyText("");
      }
    } catch {}
  };

  // 删除
  const deleteMsg = async (id: number) => {
    await fetch("/api/guestbook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "delete", isOwner: true }) });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // 漂流瓶
  const fetchBottle = async () => {
    try {
      const res = await fetch("/api/guestbook", { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setBottleMsg(data.message);
      }
    } catch {}
  };

  // 头像上传
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
        className="relative rounded-[16px] px-4 py-3.5 transition-all duration-300 overflow-hidden
                   hover:scale-[1.01] hover:-translate-y-0.5"
        style={{
          background: msg.isOwner
            ? "linear-gradient(135deg, rgba(40,50,180,0.70), rgba(120,60,180,0.70), rgba(200,50,130,0.70))"
            : "linear-gradient(135deg, rgba(255,180,210,0.10), rgba(190,160,240,0.12))",
          backdropFilter: msg.isOwner ? "none" : "blur(16px)",
          WebkitBackdropFilter: msg.isOwner ? "none" : "blur(16px)",
          border: msg.isOwner ? "1px solid rgba(200,170,240,0.35)" : "1px solid rgba(255,255,255,0.15)",
          boxShadow: msg.isOwner ? "0 0 20px rgba(100,50,200,0.20)" : "0 4px 20px rgba(0,0,0,0.08)",
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

        {/* 菜单 */}
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
            <span className="text-[9px] text-white/40 block">发布于 {msg.time}</span>
          </div>
        </div>

        {/* 正文 */}
        <p className="text-xs text-white/70 leading-relaxed mt-3 ml-12">{msg.text}</p>

        {/* 点赞 */}
        <div className="flex items-center gap-1.5 mt-3 ml-12">
          <button onClick={(e) => { e.stopPropagation(); toggleLike(msg.id); }}
            className="flex items-center gap-1.5 transition-all duration-200 hover:scale-110 active:scale-75">
            <span className="text-sm select-none"
              style={{ filter: likedIds.has(msg.id) ? "drop-shadow(0 0 5px rgba(255,80,120,0.5))" : "grayscale(1)", opacity: likedIds.has(msg.id) ? 1 : 0.3 }}>
              ❤️
            </span>
          </button>
          {(msg.likes ?? 0) > 0 && <span className="text-[10px] text-white/30 tabular-nums font-medium">{msg.likes}</span>}
        </div>

        {/* 博主回复线程 */}
        {msg.replies && msg.replies.length > 0 && (
          <div className="mt-3 ml-12 space-y-2">
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
          <div className="mt-3 ml-12 flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="回复..." maxLength={300}
              className="flex-1 rounded-lg px-3 py-1.5 text-[11px] text-white/80 outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,170,240,0.2)" }} />
            <button onClick={() => submitReply(msg.id)}
              className="text-[10px] px-3 py-1.5 rounded-lg text-white/80 bg-pink-400/20 hover:bg-pink-400/30 transition-colors">
              回复
            </button>
            <button onClick={() => setReplyId(null)}
              className="text-[10px] px-2 py-1.5 rounded-lg text-white/30 hover:text-white/50">✕</button>
          </div>
        )}
      </div>
    );
  };

  /* ====== 主渲染 ====== */
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full items-center justify-between" style={{ minHeight: "50vh" }}>

      {/* ====== 左侧：发表留言 ====== */}
      <div className="md:w-[300px] w-full rounded-[18px] p-5 md:p-6 flex flex-col h-fit max-h-full"
        style={{ background: "rgba(20,15,40,0.08)", border: "1px solid rgba(220,200,245,0.60)" }}>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm text-white/55 tracking-[0.12em]">✏️ 写下留言</h4>
          {/* 漂流瓶 */}
          <button onClick={fetchBottle} title="捞漂流瓶"
            className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-white/25 hover:text-white/50 hover:bg-white/[0.08] transition-all">
            🍾 捞瓶
          </button>
        </div>

        {/* 漂流瓶展示 */}
        {bottleMsg && (
          <div className="mb-4 rounded-xl p-3 relative"
            style={{ background: "rgba(100,140,220,0.12)", border: "1px solid rgba(150,180,240,0.2)" }}>
            <button onClick={() => setBottleMsg(null)} className="absolute top-1 right-2 text-white/20 hover:text-white/50 text-xs">✕</button>
            <p className="text-[9px] text-white/30 mb-1">🍾 你捞到了一条留言：</p>
            <p className="text-[11px] text-white/60 leading-relaxed line-clamp-4">{bottleMsg.text}</p>
            <p className="text-[9px] text-white/25 mt-1">— {bottleMsg.name} · {bottleMsg.time}</p>
          </div>
        )}

        {isOwner ? (
          /* 站长模式：极简 */
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full shrink-0 ring-2 ring-amber-400/30 overflow-hidden"
                style={{ boxShadow: "0 0 12px rgba(251,191,36,0.2)" }}>
                <img src="/assets/images/avatar.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm text-white/85 font-medium">站长</p>
                <p className="text-[10px] text-amber-300/50">博主身份</p>
              </div>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="写下你想说的话..." rows={4} maxLength={500}
              className="w-full flex-1 rounded-[14px] px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none mb-3"
              style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.15)", minHeight: "100px" }} />
            {error && <p className="text-[11px] text-amber-300/60 mb-2">{error}</p>}
            <button onClick={submit} disabled={!text.trim() || sending}
              className="w-full py-2.5 rounded-[14px] text-xs text-white/95 font-medium tracking-wider transition-all disabled:opacity-30 hover:brightness-110"
              style={{
                background: sending ? "linear-gradient(135deg, rgba(40,50,180,0.40), rgba(200,50,130,0.40))"
                  : "linear-gradient(135deg, rgba(40,50,180,0.78), rgba(120,60,180,0.78), rgba(200,50,130,0.78))",
                border: "1px solid rgba(200,170,240,0.30)", boxShadow: "0 0 14px rgba(100,50,200,0.15)",
              }}>
              {sending ? "发送中..." : "发送留言"}
            </button>
          </div>
        ) : (
          /* 游客模式 */
          <>
            <div className="flex items-center gap-3 mb-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all hover:scale-105 border-2 border-dashed border-white/15"
                style={{ background: avatarPreview ? `url(${avatarPreview}) center/cover` : "rgba(255,255,255,0.06)" }}>
                {!avatarPreview && <span className="text-white/25 text-lg">+</span>}
              </div>
              <span className="text-[10px] text-white/25">点击上传头像<br/>下次自动显示</span>
            </div>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder={defaultName || "你的名字（选填）"} maxLength={20}
              className="w-full rounded-[14px] px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none mb-3"
              style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="说点什么..." rows={5} maxLength={500}
              className="w-full rounded-[14px] px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none mb-3"
              style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.15)", minHeight: "130px" }} />
            {error && <p className="text-[11px] text-red-300/60 mb-2">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setText(""); setName(""); setError(""); setAvatarPreview(null); }}
                disabled={sending}
                className="flex-1 py-2.5 rounded-[14px] text-xs text-white/55 hover:text-white/80 transition-all disabled:opacity-0"
                style={{ background: "linear-gradient(135deg, rgba(40,50,180,0.30), rgba(120,60,180,0.30), rgba(200,50,130,0.30))", border: "1px solid rgba(180,160,240,0.15)" }}>
                清空
              </button>
              <button onClick={submit} disabled={!text.trim() || sending}
                className="flex-1 py-2.5 rounded-[14px] text-xs text-white/95 font-medium tracking-wider transition-all disabled:opacity-30 hover:brightness-110"
                style={{
                  background: sending ? "linear-gradient(135deg, rgba(40,50,180,0.40), rgba(200,50,130,0.40))"
                    : "linear-gradient(135deg, rgba(40,50,180,0.78), rgba(120,60,180,0.78), rgba(200,50,130,0.78))",
                  border: "1px solid rgba(200,170,240,0.30)", boxShadow: "0 0 14px rgba(100,50,200,0.15)",
                }}>
                {sending ? "发送中..." : "发送留言"}
              </button>
            </div>
            <p className="text-[9px] text-white/15 text-center mt-2">每人每天最多 5 条留言</p>
          </>
        )}
      </div>

      {/* ====== 右侧：留言列表 ====== */}
      <div className="md:w-[340px] w-full rounded-[18px] p-5 md:p-6 flex flex-col"
        style={{ background: "rgba(20,15,40,0.08)", border: "1px solid rgba(220,200,245,0.60)", height: "380px" }}>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm text-white/50 tracking-[0.12em]">
            💬 留言板
            {messages.length > 0 && <span className="ml-2 text-white/20">{messages.length}</span>}
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-full"><span className="text-xs text-white/15 animate-pulse">加载中...</span></div>
          ) : (
            <>
              {/* 留言列表 */}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-3xl mb-3 opacity-25">💬</span>
                  <p className="text-xs text-white/15">还没有留言，来说第一句吧</p>
                </div>
              ) : (
                messages.map(m => renderMessage(m))
              )}
            </>
          )}
        </div>
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
            background: "rgba(20,15,40,0.18)", border: "1px solid rgba(200,180,230,0.55)",
            boxShadow: "0 0 60px rgba(160,130,220,0.10)",
          }}>
          <div className="flex items-center justify-end mb-4 md:mb-6">
            <button onClick={() => setActive(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
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
          className="w-full md:w-40 aspect-square md:h-40 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-pointer"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(210,200,245,0.55)",
            boxShadow: "0 0 20px rgba(180,160,230,0.06)",
          }}>
          <span className="text-base md:text-lg font-semibold tracking-[0.15em] text-white/95 drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]">{label}</span>
          <span className="text-[10px] text-white/65 tracking-wider drop-shadow-[0_0_6px_rgba(0,0,0,0.5)]">{desc}</span>
        </button>
      ))}
    </div>
  );
}
