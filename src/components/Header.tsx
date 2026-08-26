"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { usePageStore } from "@/stores/page";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { title, subtitle } = usePageStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A5F]">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6 md:px-12">
        {/* 左侧 Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-[#C4880C]">沼</span>
          <span className="text-base font-medium text-white">液还田</span>
        </Link>

        {/* 中间标题 - 滚动后显示 */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 text-center transition-all duration-300 ${
            scrolled
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          <h1 className="text-sm font-bold tracking-tight text-white md:text-base whitespace-nowrap">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-white/60 whitespace-nowrap hidden md:block">
              {subtitle}
            </p>
          )}
        </div>

        {/* 右侧导航 */}
        <nav className="flex items-center gap-6 text-sm shrink-0">
          <Link href="/" className="text-white/80 transition hover:text-white">
            文章
          </Link>
          <Link href="/about" className="text-white/80 transition hover:text-white">
            关于
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs">
                {user.name ?? user.id}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#C4880C] px-4 py-1.5 text-xs font-medium text-white transition hover:brightness-110"
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
