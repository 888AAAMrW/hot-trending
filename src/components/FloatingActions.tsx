"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const actions = [
  { key: "posts", label: "文章", desc: "技术笔记" },
  { key: "guestbook", label: "留言", desc: "留言板" },
  { key: "about", label: "关于", desc: "关于我" },
  { key: "projects", label: "项目", desc: "航向主站" },
];

/* ====== 留言板 ====== */
interface Message {
  id: number;
  name: string;
  text: string;
  time: string;
}

function GuestbookPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blog-guestbook");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    localStorage.setItem("blog-guestbook", JSON.stringify(msgs));
  };

  const submit = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now(),
      name: name.trim() || "匿名",
      text: text.trim(),
      time: new Date().toLocaleString("zh-CN"),
    };
    saveMessages([msg, ...messages]);
    setText("");
    setName("");
  };

  const clear = () => {
    setText("");
    setName("");
  };

  return (
    <div className="flex gap-6 h-full" style={{ minHeight: "50vh" }}>
      {/* 左侧：发表留言 */}
      <div
        className="flex-1 rounded-[1.25rem] p-6 flex flex-col"
        style={{
          background: "rgba(15,10,35,0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,150,200,0.12)",
          boxShadow: "0 0 30px rgba(200,150,255,0.1)",
        }}
      >
        <h4 className="text-xs text-pink-200/55 tracking-[0.12em] mb-4">写下留言</h4>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的名字（选填）"
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white/80
                     placeholder:text-white/20 outline-none transition-colors mb-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,150,180,0.2)",
          }}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="说点什么..."
          rows={5}
          className="w-full flex-1 rounded-xl px-4 py-2.5 text-sm text-white/80
                     placeholder:text-white/20 outline-none transition-colors resize-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(150,200,255,0.2)",
          }}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={clear}
            className="flex-1 py-2 rounded-xl text-xs text-white/35
                       hover:text-white/55 transition-colors
                       bg-white/[0.02]"
          >
            清空
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="flex-1 py-2 rounded-xl text-xs text-white/85
                       transition-all disabled:opacity-20"
            style={{
              background: "linear-gradient(135deg, rgba(255,150,180,0.3), rgba(150,200,255,0.3))",
            }}
          >
            发送留言
          </button>
        </div>
      </div>

      {/* 右侧：留言列表 */}
      <div
        className="flex-1 rounded-[1.25rem] p-6 flex flex-col"
        style={{
          background: "rgba(15,10,35,0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(150,200,255,0.12)",
          boxShadow: "0 0 30px rgba(200,150,255,0.1)",
        }}
      >
        <h4 className="text-xs text-white/40 tracking-[0.12em] mb-4">
          留言列表
          {messages.length > 0 && (
            <span className="ml-2 text-white/15">{messages.length}</span>
          )}
        </h4>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1
                        scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-3xl mb-3 opacity-30">💬</span>
              <p className="text-xs text-white/15">还没有留言，来说第一句吧</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(200,150,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/50 font-medium">
                    {msg.name}
                  </span>
                  <span className="text-[9px] text-white/15">{msg.time}</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{msg.text}</p>
              </div>
            ))
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
        <div
          className="rounded-[2rem] p-10 anime-glow"
          style={{
            width: "80vw",
            maxWidth: "900px",
            minHeight: "65vh",
            background: "rgba(10,8,25,0.35)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow: "0 0 80px rgba(200,150,255,0.15), inset 0 0 40px rgba(200,150,255,0.04)",
          }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-white/80 tracking-[0.12em] font-medium">
              {panel.title}
            </h3>
            <button
              onClick={() => setActive(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-white/35 hover:text-white/70 transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ✕
            </button>
          </div>

          {/* 内容 */}
          {active === "guestbook" ? (
            <GuestbookPanel />
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-white/30 tracking-wider mb-4">
                {panel.title}内容即将上线
              </p>
              {panel.href && (
                <Link
                  href={panel.href}
                  className="text-[11px] text-amber-200/50 hover:text-amber-200/80
                             tracking-[0.1em] transition-colors"
                >
                  前往 {panel.title} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 按钮态
  return (
    <div className="flex items-center gap-6">
      {actions.map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => setActive(key)}
          className="w-40 h-40 rounded-3xl flex flex-col items-center justify-center gap-2
                     text-white/55 hover:text-white/85 transition-all duration-300
                     hover:scale-105 hover:-translate-y-1 group cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <span className="text-lg font-medium tracking-[0.15em]">{label}</span>
          <span className="text-[10px] text-white/20 group-hover:text-white/30 tracking-wider">
            {desc}
          </span>
        </button>
      ))}
    </div>
  );
}
