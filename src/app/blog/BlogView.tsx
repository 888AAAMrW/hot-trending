"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/blog/BlogCard";
import ProjectCards from "@/components/blog/ProjectCards";
import { GuestbookPanel } from "@/components/blog/FloatingActions";
import ArticleEditor from "@/components/blog/ArticleEditor";
import type { Post } from "@/lib/blog";

interface BlogViewProps {
  posts: Post[];
  aboutSection: React.ReactNode;
}

const LIMITS = { posts: 5, projects: 4 };

const TITLES: Record<string, string> = {
  posts: "✦ 文章",
  projects: "🚀 项目",
  guestbook: "",
  about: "🧑‍🚀 关于",
};

export default function BlogView({ posts, aboutSection }: BlogViewProps) {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // 站长检测
  useEffect(() => {
    const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("gb-owner=1"));
    setIsOwner(hasCookie || localStorage.getItem("gb-is-owner") === "1");
  }, []);

  // JS 平滑滚动吸附（仅桌面端）
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return;
    let lastTime = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTime < 800) return;
      lastTime = now;

      const ids = ["hero", "posts", "projects", "guestbook", "about"];
      const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      if (sections.length === 0) return;

      const current = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= current) { idx = i; break; }
      }

      if (e.deltaY > 20) idx = Math.min(idx + 1, sections.length - 1);
      else if (e.deltaY < -20) idx = Math.max(idx - 1, 0);
      else return;

      e.preventDefault();
      window.scrollTo({ top: sections[idx].offsetTop - 80, behavior: "smooth" });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const visiblePosts = showAllPosts ? posts : posts.slice(0, LIMITS.posts);

  return (
    <div className="flex flex-col px-2 md:px-0 gap-24 md:gap-48 pb-16 md:pb-32">
      <style>{`
        @keyframes aurora-sweep {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25%      { transform: rotate(-10deg); }
          50%      { transform: rotate(10deg); }
          75%      { transform: rotate(-5deg); }
        }
      `}</style>

      {/* ====== HERO ====== */}
      <section id="hero" className="scroll-mt-28 flex flex-col items-center justify-center" style={{ minHeight: "85vh" }}>
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <span className="absolute -top-5 -left-2 md:-top-6 md:-left-3"
              style={{ color: "rgba(255,255,255,0.50)", fontSize: "1.25rem", letterSpacing: "0.08em", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
              Hello,
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              I&apos;m{" "}
              <span style={{
                background: "linear-gradient(135deg, #a78bfa 20%, #7dd3fc 50%, #c084fc 80%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                filter: "drop-shadow(0 0 24px rgba(167,139,250,0.45))",
              }}>Starry Nova</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl mb-12"
            style={{ color: "rgba(255,255,255,0.40)", letterSpacing: "0.06em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            在代码与幻想的边界，记录创造的每一刻。
          </p>
          <h2 className="text-9xl md:text-[10rem] font-bold tracking-[0.2em] bg-clip-text text-transparent"
            style={{
              fontFamily: "'Caveat', cursive", WebkitTextStroke: "0.6px rgba(255,255,255,0.20)",
              backgroundImage: "linear-gradient(135deg, #ffffff, #a5d8ff, #e0c0ff, #a5d8ff, #ffffff)",
              backgroundSize: "200% 100%", animation: "aurora-sweep 8s ease-in-out infinite",
              filter: "drop-shadow(0 0 50px rgba(180,200,240,0.45))",
            }}>WELCOME</h2>
          <p className="text-xl md:text-2xl tracking-[0.12em] mt-3"
            style={{ color: "rgba(255,255,255,0.60)", textShadow: "0 1px 8px rgba(0,0,0,0.6), 0 0 24px rgba(200,160,240,0.15)" }}>
            代码与浪漫，在此交汇
          </p>
        </div>
      </section>

      {/* ====== 文章 ====== */}
      <Section id="posts" title={TITLES.posts}>
        {posts.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>暂无文章</p>
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex flex-col gap-4">
              {visiblePosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
            {posts.length > LIMITS.posts && (
              <button onClick={() => setShowAllPosts(!showAllPosts)}
                className="mt-5 w-full py-2.5 rounded-[12px] text-xs tracking-wider transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.40)", textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.70)"; e.currentTarget.style.borderColor = "rgba(200,170,240,0.30)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {showAllPosts ? "收起" : `查看更多文章 (${posts.length - LIMITS.posts}) →`}
              </button>
            )}
            {/* 站长：写文章 */}
            {isOwner && (
              <div className="mt-4">
                {showEditor ? (
                  <ArticleEditor onClose={() => setShowEditor(false)} />
                ) : (
                  <button onClick={() => setShowEditor(true)}
                    className="w-full py-2.5 rounded-[12px] text-xs tracking-wider transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(200,170,240,0.30)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  >
                    + 写文章
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ====== 项目 ====== */}
      <Section id="projects" title={TITLES.projects}>
        <div className="w-full max-w-3xl mx-auto">
          <ProjectCards limit={showAllProjects ? undefined : LIMITS.projects} />
          <button onClick={() => setShowAllProjects(!showAllProjects)}
            className="mt-5 w-full py-2.5 rounded-[12px] text-xs tracking-wider transition-all"
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.40)", textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.70)"; e.currentTarget.style.borderColor = "rgba(200,170,240,0.30)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            {showAllProjects ? "收起" : "查看更多项目 →"}
          </button>
        </div>
      </Section>

      {/* ====== 留言 ====== */}
      <Section id="guestbook" title="">
        <GuestbookPanel />
      </Section>

      {/* ====== 关于 ====== */}
      <Section id="about" title={TITLES.about}>
        {aboutSection}
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 w-full flex flex-col items-center justify-center" style={{ minHeight: "70vh" }}>
      <div className="w-full">
        {title && (
          <h2 className="text-sm tracking-[0.15em] mb-5"
            style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
