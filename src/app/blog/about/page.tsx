export default function AboutPage() {
  return (
    <div className="rounded-2xl backdrop-blur-xl bg-black/20 border border-white/[0.06] p-5
                  shadow-[0_0_40px_rgba(0,0,0,0.15)]">
      <h2 className="text-sm text-white/55 mb-4 tracking-wide">关于</h2>
      <div className="text-xs text-white/40 leading-relaxed space-y-3">
        <p>
          深空博客是 Starry Nova 的一部分，记录技术笔记、思考碎片与星际航行日志。
        </p>
        <p>
          文章主题涵盖前端开发、系统设计、工具链，以及偶尔的随笔和灵感记录。
        </p>
      </div>
    </div>
  );
}
