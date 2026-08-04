"use client";

import { useState } from "react";

export default function ArticleEditor({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    if (!title.trim() || !slug.trim()) { setMsg("标题和 slug 不能为空"); return; }
    setSaving(true); setMsg("");
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: slug.trim().replace(/\s+/g, "-").toLowerCase(),
        description: desc.trim(),
        content: content.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setMsg("发布成功！刷新页面即可看到。");
      setTimeout(onClose, 1500);
    } else {
      const d = await res.json();
      setMsg(d.error || "发布失败");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "rgba(22,16,50,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(200,180,240,0.30)", boxShadow: "0 8px 32px rgba(0,0,0,0.20)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-white/70 tracking-wider">✍️ 写文章</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 text-sm">✕</button>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题" maxLength={200}
        className="rounded-[10px] px-4 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,180,230,0.15)" }} />
      <div className="flex gap-2">
        <input value={slug} onChange={(e) => setSlug(e.target.value)}
          placeholder="slug（如 hello-world）" maxLength={100}
          className="flex-1 rounded-[10px] px-4 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,180,230,0.15)" }} />
        <input value={tags} onChange={(e) => setTags(e.target.value)}
          placeholder="标签,逗号分隔" maxLength={200}
          className="flex-1 rounded-[10px] px-4 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,180,230,0.15)" }} />
      </div>
      <input value={desc} onChange={(e) => setDesc(e.target.value)}
        placeholder="简短描述（选填）" maxLength={500}
        className="rounded-[10px] px-4 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,180,230,0.15)" }} />
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="正文（支持 Markdown：# 标题 **加粗** - 列表）" rows={12} maxLength={100000}
        className="rounded-[10px] px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none resize-none font-mono"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,180,230,0.15)", minHeight: "240px" }} />
      {msg && <p className="text-[11px] text-amber-300/60">{msg}</p>}
      <button onClick={save} disabled={saving}
        className="w-full py-2.5 rounded-[12px] text-xs font-medium tracking-wider transition-all disabled:opacity-30"
        style={{ background: "rgba(160,140,220,0.35)", border: "1px solid rgba(200,170,240,0.30)", color: "rgba(255,255,255,0.90)" }}>
        {saving ? "发布中..." : "发布文章"}
      </button>
    </div>
  );
}
