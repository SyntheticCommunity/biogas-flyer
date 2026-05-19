"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function Header() {
  const { user, logout, isAdmin } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A5F]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#C4880C]">沼</span>
          <span className="text-base font-medium text-white">液还田</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/80 transition hover:text-white">
            文章
          </Link>
          <Link href="/about" className="text-white/80 transition hover:text-white">
            关于
          </Link>
          {isAdmin() && (
            <Link href="/admin" className="text-white/80 transition hover:text-white">
              管理
            </Link>
          )}
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
