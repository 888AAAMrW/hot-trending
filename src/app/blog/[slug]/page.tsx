import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";
import TagBadge from "@/components/blog/TagBadge";
import GiscusComments from "@/components/blog/GiscusComments";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const date = new Date(post.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* 返回链接 */}
      <Link href="/blog" className="inline-flex items-center gap-1.5 mb-5 text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
        ← 返回博客
      </Link>

      <article className="rounded-2xl backdrop-blur-xl border p-6"
        style={{
          background: "rgba(10,8,25,0.50)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 40px rgba(0,0,0,0.15)",
        }}>
        {/* 文章头 */}
        <header className="mb-8">
          {/* 菱形装饰 */}
          <span
            className="inline-block w-2 h-2 bg-amber-400/50 rotate-45 mb-4"
            style={{ boxShadow: "0 0 6px rgba(251,191,36,0.25)" }}
          />

          <h1 className="text-lg font-bold leading-snug tracking-wide"
            style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-[11px]"
            style={{ color: "rgba(255,255,255,0.40)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            <time dateTime={post.date}>{date}</time>
            {post.updated && (
              <span>
                更新于{" "}
                {new Date(post.updated).toLocaleDateString("zh-CN")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </header>

        {/* 分隔金线 */}
        <div className="w-full h-px bg-gradient-to-r from-amber-400/20 via-transparent to-transparent mb-8" />

        {/* 文章正文 */}
        <div
          className="prose prose-invert max-w-none text-[13px]
            prose-headings:text-white/85 prose-headings:font-medium prose-headings:tracking-wide
            prose-h2:text-sm prose-h2:mt-8 prose-h2:mb-3 prose-h2:flex prose-h2:items-center prose-h2:gap-2
            prose-h3:text-[13px] prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-white/55 prose-p:leading-relaxed
            prose-a:text-amber-300/80 prose-a:no-underline hover:prose-a:text-amber-300
            prose-strong:text-white/90
            prose-code:text-amber-300/80 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl prose-pre:text-[11px]
            prose-img:rounded-xl
            prose-blockquote:border-l-amber-400/30 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
            prose-blockquote:text-white/50 prose-blockquote:not-italic prose-blockquote:text-[11px]
            prose-li:text-white/50 prose-li:text-[12px]
            prose-hr:border-white/[0.06]
            prose-table:border-white/[0.06]
            [&_p]:[text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 文章脚 — 评论区 */}
        <footer className="mt-12 pt-6 border-t border-white/[0.06]">
          <GiscusComments />
        </footer>
      </article>
    </>
  );
}
