"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await fetchAPI("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
      }

      const loginResult = await fetchAPI<{ data: { access_token: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const token = loginResult.data.access_token;
      localStorage.setItem("token", token);

      const meResult = await fetchAPI<{ data: { id: number; username: string; display_name: string | null; role: string } }>("/auth/me");
      setAuth({ id: String(meResult.data.id), name: meResult.data.display_name || meResult.data.username, avatar_url: null }, token);
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "操作失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          {isRegister ? "注册账号" : "登录"}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isRegister ? "创建新账号" : "使用账号密码登录"}
        </p>

        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "处理中..." : isRegister ? "注册并登录" : "登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {isRegister ? "已有账号？" : "没有账号？"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="ml-1 text-emerald-600 hover:underline"
          >
            {isRegister ? "去登录" : "去注册"}
          </button>
        </p>
      </div>
    </div>
  );
}
