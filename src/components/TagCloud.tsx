import TagBadge from "./TagBadge";

interface TagCloudProps {
  tags: { tag: string; count: number }[];
  activeTag?: string;
}

export default function TagCloud({ tags, activeTag }: TagCloudProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <TagBadge tag="全部" active={!activeTag} href="/blog" />
      {tags.map(({ tag, count }) => (
        <TagBadge key={tag} tag={tag} active={activeTag === tag} />
      ))}
    </div>
  );
}
