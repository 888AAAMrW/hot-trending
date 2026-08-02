export default function BlogPage() {
  return (
    <div className="space-y-8">
      {/* ====== 英雄标题区 ====== */}
      <header className="text-center pt-2 pb-4">
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
      </header>
    </div>
  );
}
