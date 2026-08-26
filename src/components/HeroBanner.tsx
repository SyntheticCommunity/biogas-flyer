"use client";

import { useEffect, useState } from "react";

export default function HeroBanner() {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className={`sticky top-12 z-40 overflow-hidden bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white shadow-sm transition-all duration-300 ease-out ${
        isShrunk ? "py-2" : "py-14 md:py-20"
      }`}
    >
      <div className="mx-auto max-w-5xl px-6 text-center md:px-12">
        {/* 金色装饰线 */}
        <div
          className={`mx-auto h-[3px] rounded bg-[#C4880C] transition-all duration-300 ${
            isShrunk ? "mb-0 h-0 w-0 opacity-0" : "mb-4 w-8 opacity-100"
          }`}
        />
        {/* 标题 */}
        <h1
          className={`font-bold tracking-tight transition-all duration-300 ${
            isShrunk
              ? "text-base md:text-lg"
              : "text-3xl md:text-4xl lg:text-5xl"
          }`}
        >
          沼液还田科普站
        </h1>
        {/* 副标题 */}
        <p
          className={`text-white/70 transition-all duration-300 ${
            isShrunk
              ? "mt-1 text-xs opacity-80"
              : "mt-3 text-base opacity-100 md:text-lg"
          }`}
        >
          科学还田 · 绿色循环 · 乡村振兴
        </p>
      </div>
    </section>
  );
}
