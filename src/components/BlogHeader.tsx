import Link from "next/link";

export default function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-text-primary font-semibold tracking-wider text-sm hover:text-white transition-colors"
          >
            ✦ 深空博客
          </Link>
          <Link
            href="https://starrynova.cc"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 返回 Starry Nova
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <a
            href="/feed.xml"
            className="text-xs text-text-muted hover:text-orange-400 transition-colors flex items-center gap-1"
            title="RSS 订阅"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
            </svg>
            RSS
          </a>
        </nav>
      </div>
    </header>
  );
}
