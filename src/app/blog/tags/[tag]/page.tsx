import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTags, getPostsByTag } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `标签: ${decoded}`,
    description: `浏览标签为 "${decoded}" 的所有文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary tracking-wider">
          标签: {decoded}
        </h1>
        <p className="text-sm text-text-tertiary mt-2">
          {posts.length} 篇文章
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {posts.map((post, i) => (
          <div
            key={post.slug}
            className="animate-item-in"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
