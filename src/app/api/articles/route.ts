import { getArticles, createArticle } from "@/lib/article-store";

export async function GET() {
  const articles = await getArticles();
  return Response.json({ articles: articles.filter((a) => !a.draft) });
}

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("gb-owner=1")) {
    return Response.json({ error: "只有站长能写文章" }, { status: 403 });
  }
  const body = await request.json();
  const { title, description, content, tags, slug } = body;
  if (!title || !slug) return Response.json({ error: "标题和 slug 不能为空" }, { status: 400 });
  const article = await createArticle({
    slug: String(slug).replace(/\s+/g, "-").toLowerCase(),
    title: String(title).slice(0, 200),
    description: String(description || "").slice(0, 500),
    content: String(content || ""),
    tags: tags || [],
    draft: body.draft ?? false,
  });
  return Response.json({ article });
}
