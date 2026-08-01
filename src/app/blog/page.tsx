import { getPublishedPosts, getAllTags } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import TagCloud from "@/components/TagCloud";

export default function BlogPage() {
  const published = getPublishedPosts();
  const tags = getAllTags();

  if (published.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <span className="text-6xl mb-6">📡</span>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          信号静默
        </h2>
        <p className="text-sm text-text-tertiary max-w-md">
          深空中暂时还没有信号。当第一篇文章发布时，它会出现在这里。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary tracking-wider">
          ✦ 深空博客
        </h1>
        <p className="text-sm text-text-tertiary mt-2 leading-relaxed">
          技术笔记 · 思考碎片 · 星际日志
        </p>
        <TagCloud tags={tags} />
      </div>

      {/* Post list */}
      <div className="flex flex-col gap-5">
        {published.map((post, i) => (
          <div
            key={post.slug}
            className="animate-item-in"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <BlogCard post={post} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border-subtle text-center text-xs text-text-muted">
        {published.length} 篇文章 · 星辰大海中持续航行 🚀
      </footer>
    </div>
  );
}
