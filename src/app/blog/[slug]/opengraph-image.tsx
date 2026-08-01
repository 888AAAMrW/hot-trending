import { ImageResponse } from "next/og";
import { getPublishedPosts } from "@/lib/blog";

export const runtime = "edge";
export const alt = "Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPublishedPosts().find((p) => p.slug === slug);
  if (!post) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #060912 0%, #0d1120 50%, #151b30 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "#f1f5f9",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.2,
            display: "-webkit-box",
            overflow: "hidden",
          }}
        >
          {post.title}
        </div>

        {post.description && (
          <div
            style={{
              fontSize: 24,
              color: "#94a3b8",
              marginTop: 24,
              lineHeight: 1.4,
            }}
          >
            {post.description}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {post.tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 18,
                color: "#7C3AED",
                background: "rgba(124, 58, 237, 0.15)",
                padding: "4px 16px",
                borderRadius: 999,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 20, color: "#64748b", marginTop: 40 }}>
          {new Date(post.date).toLocaleDateString("zh-CN")}
        </div>
      </div>
    ),
    { ...size }
  );
}
