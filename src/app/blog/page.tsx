import FloatingActions from "@/components/FloatingActions";

export default function BlogPage() {
  return (
    <>
      {/* WELCOME 标题 */}
      <div className="text-center pt-2 pb-4">
        <h1 className="text-7xl md:text-8xl font-bold tracking-[0.25em]
                       bg-gradient-to-r from-amber-300 via-pink-400 to-violet-400
                       bg-clip-text text-transparent
                       drop-shadow-[0_0_40px_rgba(200,150,255,0.25)]"
            style={{ fontFamily: "'Caveat', cursive", WebkitTextStroke: "0.5px rgba(255,255,255,0.15)" }}>
          WELCOME
        </h1>
        <p className="text-base text-white/50 tracking-[0.12em] mt-2">
          代码与浪漫，在此交汇
        </p>
      </div>

      {/* 中央悬浮按钮 — 固定在屏幕正中 */}
      <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingActions />
        </div>
      </div>
    </>
  );
}
