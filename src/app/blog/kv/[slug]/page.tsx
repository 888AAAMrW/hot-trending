import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/article-store";
import TagBadge from "@/components/blog/TagBadge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-[13px] font-medium text-white/80 mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-medium text-white/80 mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white/85 mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="text-amber-300/80 bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px]">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-white/50 text-[12px] ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-white/50 text-[13px] leading-relaxed">')
    .replace(/^(.+)$/gm, '<p class="text-white/50 text-[13px] leading-relaxed">$1</p>');
}

export default async function KVArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post || post.draft) notFound();

  const date = new Date(post.date).toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <Link href="/blog" className="inline-flex items-center gap-1.5 mb-5 text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
        ← 返回博客
      </Link>

      <article className="rounded-2xl backdrop-blur-xl border p-6"
        style={{ background: "rgba(10,8,25,0.50)", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(0,0,0,0.15)" }}>
        <header className="mb-8">
          <span className="inline-block w-2 h-2 bg-amber-400/50 rotate-45 mb-4"
            style={{ boxShadow: "0 0 6px rgba(251,191,36,0.25)" }} />
          <h1 className="text-lg font-bold leading-snug tracking-wide"
            style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            <time>{date}</time>
            {post.updated && <span>更新于 {new Date(post.updated).toLocaleDateString("zh-CN")}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {post.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        </header>

        <div className="w-full h-px bg-gradient-to-r from-amber-400/20 via-transparent to-transparent mb-8" />

        <div className="text-[13px] space-y-3" style={{ color: "rgba(255,255,255,0.50)", lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      </article>
    </>
  );
}
