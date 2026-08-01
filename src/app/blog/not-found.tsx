import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <span className="text-6xl mb-6">🪐</span>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        迷失在深空中
      </h2>
      <p className="text-sm text-text-tertiary mb-8 max-w-md">
        你要找的页面已经消失在星云里了。也许是一篇不存在的文章，或者一个错误的坐标。
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="text-sm px-5 py-2 rounded-full bg-surface-elevated text-text-secondary hover:text-white hover:bg-surface-overlay border border-border-subtle transition-colors"
        >
          ← 返回博客首页
        </Link>
        <Link
          href="https://starrynova.cc"
          className="text-sm px-5 py-2 rounded-full bg-surface-elevated text-text-secondary hover:text-white hover:bg-surface-overlay border border-border-subtle transition-colors"
        >
          Starry Nova →
        </Link>
      </div>
    </div>
  );
}
