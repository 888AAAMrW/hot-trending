"use client";

export default function AboutPage() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col md:flex-row gap-6"
      style={{
        background: "rgba(22,16,50,0.52)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 16px 40px rgba(8,4,28,0.35)",
      }}
    >
      {/* 左：头像 */}
      <div className="flex flex-col items-center gap-4 shrink-0">
        <div
          className="w-24 h-24 rounded-full overflow-hidden"
          style={{
            border: "2px solid rgba(255,150,180,0.30)",
            boxShadow: "0 0 20px rgba(255,150,180,0.12), 0 4px 12px rgba(0,0,0,0.20)",
          }}
        >
          <img
            src="/assets/images/avatar.png"
            alt="站长"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 10%" }}
          />
        </div>
        {/* 社交图标 */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/888AAAMrW"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.40)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.80)";
              e.currentTarget.style.borderColor = "rgba(200,180,240,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.40)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="mailto:790009027@qq.com"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.40)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.80)";
              e.currentTarget.style.borderColor = "rgba(200,180,240,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.40)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 6l10 7 10-7" />
            </svg>
          </a>
          <a
            href="/feed.xml"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.40)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.80)";
              e.currentTarget.style.borderColor = "rgba(200,180,240,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.40)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
            </svg>
          </a>
        </div>
      </div>

      {/* 右：介绍 */}
      <div className="flex flex-col justify-center gap-3">
        <h2
          className="text-sm tracking-[0.15em]"
          style={{
            color: "rgba(255,255,255,0.55)",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          关于深空博客
        </h2>
        <p
          className="text-xs leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.55)",
            textShadow: "0 1px 3px rgba(0,0,0,0.35)",
          }}
        >
          深空博客是 Starry Nova 观测站的一部分，记录技术笔记、思考碎片与星际航行日志。
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.40)",
            textShadow: "0 1px 2px rgba(0,0,0,0.30)",
          }}
        >
          文章涵盖前端开发、系统设计、AI 实验，以及偶尔的随笔与灵感。在代码与幻想的边界，记录创造的每一刻。
        </p>
        {/* 建站信息 */}
        <div
          className="flex items-center gap-3 mt-1"
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          <span>✦ 建于 2025.06</span>
          <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.10)" }} />
          <span>🪐 航行于深空</span>
        </div>
      </div>
    </div>
  );
}
