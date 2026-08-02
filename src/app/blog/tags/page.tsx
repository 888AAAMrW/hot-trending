import { getAllTags } from "@/lib/blog";
import Link from "next/link";

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-black/20 border border-white/[0.06] p-5
                  shadow-[0_0_40px_rgba(0,0,0,0.15)]">
      <h2 className="text-sm text-white/55 mb-4 tracking-wide">标签</h2>
      {tags.length === 0 ? (
        <p className="text-xs text-white/30">暂无标签</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-white/55 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80 transition-colors"
            >
              {tag}
              <span className="ml-1.5 text-[10px] text-white/20">{count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
