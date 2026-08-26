"use client";

import { useEffect, useState } from "react";

function BannerContent({
  isShrunk,
  title,
  subtitle,
}: {
  isShrunk: boolean;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 text-center md:px-12">
      <div
        className={`mx-auto h-[3px] rounded bg-[#C4880C] transition-all duration-300 ${
          isShrunk ? "mb-0 h-0 w-0 opacity-0" : "mb-4 w-8 opacity-100"
        }`}
      />
      <h1
        className={`font-bold tracking-tight transition-all duration-300 ${
          isShrunk
            ? "text-base md:text-lg"
            : "animate-fade-in-up text-3xl md:text-4xl lg:text-5xl"
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-white/70 transition-all duration-300 ${
            isShrunk
              ? "mt-1 text-xs opacity-80"
              : "animation-delay-200 animate-fade-in-up mt-3 text-base opacity-100 md:text-lg"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  showCurve?: boolean;
}

export default function HeroBanner({
  title = "沼液还田科普站",
  subtitle = "科学还田 · 绿色循环 · 乡村振兴",
  showCurve = false,
}: HeroBannerProps) {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 80);
    };
    handleScroll(); // 立即同步一次，防止刷新后状态不同步
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 大 Banner - 正常文档流，滚动后自然离开视口 */}
      <section
        className={`relative overflow-hidden bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white transition-all duration-300 ease-out ${
          isShrunk ? "max-h-0 opacity-0" : "max-h-[400px] opacity-100"
        } ${showCurve ? "hero-curve" : ""}`}
      >
        <div className="py-14 md:py-20">
          <BannerContent isShrunk={false} title={title} subtitle={subtitle} />
        </div>
      </section>

      {/* 收缩版 Banner - fixed 定位，不影响文档流 */}
      <div
        className={`fixed left-0 right-0 top-12 z-40 bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white shadow-sm transition-all duration-300 ease-out ${
          isShrunk
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="py-2">
          <BannerContent isShrunk={true} title={title} subtitle={subtitle} />
        </div>
      </div>
    </>
  );
}
