"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginResult = await fetchAPI<{ data: { access_token: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const token = loginResult.data.access_token;
      localStorage.setItem("token", token);

      const meResult = await fetchAPI<{ data: { id: number; username: string; display_name: string | null; role: string } }>("/auth/me");
      setAuth({ id: String(meResult.data.id), name: meResult.data.display_name || meResult.data.username, avatar_url: null }, token);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <h3 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          登录
        </h3>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          使用账号密码登录
        </p>

        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          没有账号？请先到 <a href="https://bio-spring.top" target="_blank" className="text-emerald-600 hover:underline">bio-spring.top</a> 注册
        </p>
      </div>
    </div>
  );
}
