import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  active?: boolean;
}

export default function TagBadge({ tag, active }: TagBadgeProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className={`inline-block text-xs px-2.5 py-1 rounded-full border transition-colors
        ${
          active
            ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
            : "bg-surface-overlay/60 border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-default"
        }`}
    >
      {tag}
    </Link>
  );
}
