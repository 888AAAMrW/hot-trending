"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  desc: string;
  href: string;
  icon: string;
  tags: string[];
}

export default function ProjectCards({ limit }: { limit?: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", href: "", icon: "📦", tags: "" });

  useEffect(() => {
    const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("gb-owner=1"));
    setIsOwner(hasCookie || localStorage.getItem("gb-is-owner") === "1");
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const add = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      const d = await res.json();
      setProjects((p) => [...p, d.project]);
      setForm({ name: "", desc: "", href: "", icon: "📦", tags: "" });
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setProjects((p) => p.filter((pr) => pr.id !== id));
  };

  const items = limit ? projects.slice(0, limit) : projects;

  if (projects.length === 0 && !isOwner) {
    return <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>暂无项目</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((p) => (
          <div key={p.id} className="relative group">
            <a
              href={p.href}
              target={p.href.startsWith("http") ? "_blank" : undefined}
              rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 block"
              style={{
                background: "rgba(22,16,50,0.52)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                e.currentTarget.style.borderColor = "rgba(200,170,240,0.45)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18), 0 0 20px rgba(180,150,220,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-base font-semibold block"
                    style={{ color: "rgba(255,255,255,0.90)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                    {p.name}
                  </span>
                </div>
                <span className="text-white/20 group-hover:text-amber-400/60 group-hover:translate-x-0.5 transition-all text-sm shrink-0">→</span>
              </div>
              <p className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                {p.desc}
              </p>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border"
                      style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </a>
            {/* 站长删除按钮 */}
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(255,60,80,0.20)", border: "1px solid rgba(255,100,120,0.30)", color: "rgba(255,255,255,0.60)", fontSize: "10px" }}
                title="删除项目"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 站长：添加项目 */}
      {isOwner && (
        <div className="mt-4">
          {adding ? (
            <div className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,180,240,0.18)" }}>
              <div className="flex gap-2">
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="图标" maxLength={4}
                  className="w-16 rounded-[10px] px-3 py-2 text-sm text-center text-white/85 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="项目名" maxLength={30}
                  className="flex-1 rounded-[10px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
              </div>
              <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="描述" maxLength={100}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
              <div className="flex gap-2">
                <input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })}
                  placeholder="链接（可选）" maxLength={200}
                  className="flex-1 rounded-[10px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="标签,逗号分隔" maxLength={100}
                  className="flex-1 rounded-[10px] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,180,230,0.20)" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={add}
                  className="flex-1 py-2 rounded-[10px] text-xs font-medium text-white/90"
                  style={{ background: "rgba(160,140,220,0.35)", border: "1px solid rgba(200,170,240,0.30)" }}>
                  添加
                </button>
                <button onClick={() => setAdding(false)}
                  className="px-4 py-2 rounded-[10px] text-xs text-white/40 hover:text-white/60">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-2.5 rounded-[12px] text-xs tracking-wider transition-all"
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(200,170,240,0.30)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              + 添加项目
            </button>
          )}
        </div>
      )}
    </div>
  );
}
