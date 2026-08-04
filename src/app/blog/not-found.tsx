import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "60vh" }}>
      <span className="text-6xl mb-6">🪐</span>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
        迷失在深空中
      </h2>
      <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.40)", maxWidth: "28rem", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
        你要找的页面已经消失在星云里了。
      </p>
      <div className="flex gap-4">
        <Link href="/blog"
          className="text-sm px-5 py-2 rounded-full transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.55)", textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}>
          ← 返回博客
        </Link>
        <Link href="https://starrynova.cc"
          className="text-sm px-5 py-2 rounded-full transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.55)", textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}>
          Starry Nova →
        </Link>
      </div>
    </div>
  );
}
