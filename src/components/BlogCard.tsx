import Link from "next/link";
import type { Post } from "@/lib/blog";

interface BlogCardProps {
  post: Post;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogCard({ post }: BlogCardProps) {
  const date = formatDate(post.date);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group/card backdrop-blur-xl bg-black/20
                 rounded-2xl border border-white/[0.06] p-5
                 shadow-[0_0_40px_rgba(0,0,0,0.15)]
                 hover:bg-black/30 hover:border-amber-400/10
                 hover:shadow-[0_0_40px_rgba(251,191,36,0.06)]
                 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* 菱形装饰 + 标题 */}
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block w-1.5 h-1.5 bg-amber-400/40 rotate-45 shrink-0
                         group-hover/card:bg-amber-400/70 transition-colors"
              style={{ boxShadow: "0 0 4px rgba(251,191,36,0.2)" }}
            />
            <h2 className="text-sm font-medium text-white/80 group-hover/card:text-white/95 transition-colors truncate">
              {post.title}
            </h2>
          </div>

          {/* 描述 */}
          {post.description && (
            <p className="text-xs text-white/35 mt-2 leading-relaxed line-clamp-2 ml-4">
              {post.description}
            </p>
          )}
        </div>

        {/* 日期 + 箭头 */}
        <div className="flex items-center gap-3 shrink-0">
          <time className="text-[10px] text-white/20 whitespace-nowrap">
            {date}
          </time>
          <span className="text-white/15 group-hover/card:text-amber-400/60 group-hover/card:translate-x-0.5 transition-all text-xs">
            →
          </span>
        </div>
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 ml-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full
                         bg-white/[0.04] text-white/30 border border-white/[0.05]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
