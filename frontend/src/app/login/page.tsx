"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth callback token first
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    // Consume the token param
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.toString());

    localStorage.setItem("token", token);
    fetchAPI<{ id: string; name: string | null; avatar_url: string | null; is_admin: boolean }>(
      "/auth/me",
    )
      .then((user) => {
        setAuth(user, token);
        router.replace("/");
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("登录失败，请重试");
      });
  }, [router, setAuth]);

  // Fetch QR code URL
  useEffect(() => {
    let cancelled = false;

    fetchAPI<{ url: string }>("/auth/wechat/qrcode")
      .then(({ url }) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "无法加载二维码");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          微信扫码登录
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          使用微信扫描下方二维码完成登录
        </p>

        <div className="flex items-center justify-center">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!error && !qrUrl && (
            <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          )}
          {!error && qrUrl && (
            <iframe
              src={qrUrl}
              className="h-56 w-56 rounded-lg border-0"
              title="微信登录二维码"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
}
