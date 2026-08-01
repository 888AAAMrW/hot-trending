import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";
import TagBadge from "@/components/TagBadge";
import GiscusComments from "@/components/GiscusComments";

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

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* 文章头 */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-text-primary leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
            <time dateTime={post.date}>{date}</time>
            {post.updated && (
              <span>
                更新于{" "}
                {new Date(post.updated).toLocaleDateString("zh-CN")}
              </span>
            )}
          </div>
        </header>

        {/* 文章正文 */}
        <div
          className="prose prose-invert max-w-none
            prose-headings:text-text-primary prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-code:text-blue-300 prose-code:bg-surface-overlay prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-surface-card prose-pre:border prose-pre:border-border-default prose-pre:rounded-xl
            prose-pre:shadow-lg
            prose-img:rounded-xl
            prose-blockquote:border-l-blue-600 prose-blockquote:bg-surface-card/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
            prose-blockquote:text-text-tertiary prose-blockquote:not-italic
            prose-li:text-text-secondary
            prose-hr:border-border-subtle
            prose-table:border-border-subtle
            "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 文章脚 — 评论区 */}
        <footer className="mt-16 pt-8 border-t border-border-subtle">
          <GiscusComments />
        </footer>
      </article>
    </>
  );
}
