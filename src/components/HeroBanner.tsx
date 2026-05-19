export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <div className="mx-auto mb-4 h-[3px] w-8 rounded bg-[#C4880C]" />
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          沼液还田科普站
        </h1>
        <p className="mt-3 text-base text-white/70 md:text-lg">
          科学还田 · 绿色循环 · 乡村振兴
        </p>
      </div>
    </section>
  );
}
