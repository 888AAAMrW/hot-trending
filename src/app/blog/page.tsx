import { getPublishedPosts } from "@/lib/blog";
import { getArticles } from "@/lib/article-store";
import BlogView from "./BlogView";

export default async function BlogPage() {
  const velitePosts = getPublishedPosts();
  const kvArticles = await getArticles();
  const kvPosts = kvArticles
    .filter((a) => !a.draft)
    .map((a) => ({
      slug: `kv/${a.slug}`,
      title: a.title,
      description: a.description,
      date: a.date,
      updated: a.updated,
      tags: a.tags,
      draft: false,
      content: a.content,
    }));
  const posts = [...velitePosts, ...kvPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <BlogView
      posts={posts}
      aboutSection={
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 w-full max-w-2xl mx-auto"
          style={{
            background: "rgba(22,16,50,0.52)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 16px 40px rgba(8,4,28,0.35)",
          }}
        >
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div
              className="w-20 h-20 rounded-full overflow-hidden"
              style={{
                border: "2px solid rgba(255,150,180,0.30)",
                boxShadow: "0 0 20px rgba(255,150,180,0.12)",
              }}
            >
              <img
                src="/assets/images/avatar.png"
                alt="站长"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 10%" }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>
              深空博客是 Starry Nova 观测站的一部分，记录技术笔记、思考碎片与星际航行日志。
            </p>
            <p className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.40)", textShadow: "0 1px 2px rgba(0,0,0,0.30)" }}>
              在代码与幻想的边界，记录创造的每一刻。
            </p>
          </div>
        </div>
      }
    />
  );
}
