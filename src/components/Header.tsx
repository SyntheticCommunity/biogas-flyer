"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function Header() {
  const { user, logout, isAdmin } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold text-green-700">
          沼液还田科普站
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-green-700 dark:text-gray-300">
            文章
          </Link>
          {isAdmin() && (
            <Link href="/admin" className="text-gray-600 hover:text-green-700 dark:text-gray-300">
              管理
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">
                {user.name ?? user.id}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
