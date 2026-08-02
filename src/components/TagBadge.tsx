import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  href?: string;
}

export default function TagBadge({ tag, active, href }: TagBadgeProps) {
  return (
    <Link
      href={href ?? `/blog/tags/${encodeURIComponent(tag)}`}
      className={`inline-block text-[11px] px-2.5 py-1 rounded-full border transition-all tracking-wider
        ${
          active
            ? "bg-amber-400/10 border-amber-400/25 text-amber-300/90"
            : "bg-white/[0.03] border-white/[0.06] text-white/45 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.05]"
        }`}
    >
      {tag}
    </Link>
  );
}
