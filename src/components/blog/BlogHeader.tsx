import Link from "next/link";

export default function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 p-6">
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="text-white/80 font-semibold tracking-wider text-sm hover:text-white transition-colors drop-shadow-lg"
        >
          ✦ 深空博客
        </Link>
        <Link
          href="https://starrynova.cc"
          className="text-xs text-white/40 hover:text-white/70 transition-colors drop-shadow-lg"
        >
          ← Starry Nova
        </Link>
        <a
          href="/feed.xml"
          className="text-xs text-white/40 hover:text-orange-400 transition-colors flex items-center gap-1 drop-shadow-lg"
          title="RSS"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
          </svg>
          RSS
        </a>
      </div>
    </header>
  );
}
