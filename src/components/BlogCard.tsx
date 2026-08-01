import Link from "next/link";
import TagBadge from "./TagBadge";
import type { Post } from "@/lib/blog";

interface BlogCardProps {
  post: Post;
}

export default function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/${post.slug}`}
      className="card-blog rounded-2xl p-6 block group/card"
      style={{
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.04)",
          "0 0 40px rgba(124,58,237,0.06)",
          "inset 0 1px 0 rgba(255,255,255,0.02)",
        ].join(", "),
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-text-primary group-hover/card:text-white transition-colors leading-snug">
            {post.title}
          </h2>
          <time className="text-xs text-text-muted whitespace-nowrap mt-1 flex-shrink-0">
            {date}
          </time>
        </div>

        <p className="text-sm text-text-tertiary leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-surface-overlay/60 text-text-muted border border-border-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="text-xs text-blue-500/70 group-hover/card:text-blue-400 transition-colors mt-1">
          阅读 →
        </span>
      </div>
    </Link>
  );
}
