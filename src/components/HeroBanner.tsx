export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          沼液还田科普站
        </h1>
        <p className="mt-4 text-lg opacity-90 md:text-xl">
          科学种田 · 绿色循环 · 乡村振兴
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="#articles"
            className="rounded-full bg-white/20 px-6 py-3 text-sm font-medium backdrop-blur-sm transition hover:bg-white/30"
          >
            浏览文章
          </a>
        </div>
      </div>
    </section>
  );
}
