"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Fetch QR code URL when dialog opens
  useEffect(() => {
    if (!open) {
      setQrUrl(null);
      setError(null);
      return;
    }

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
  }, [open]);

  // Listen for OAuth callback via URL params
  useEffect(() => {
    if (!open) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    // Consume the token param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.toString());

    // Fetch user profile with the token
    localStorage.setItem("token", token);
    fetchAPI<{ id: string; name: string | null; avatar_url: string | null; is_admin: boolean }>(
      "/auth/me",
    )
      .then((user) => {
        setAuth(user, token);
        onClose();
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("登录失败，请重试");
      });
  }, [open, onClose, setAuth]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <h3 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          微信扫码登录
        </h3>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          使用微信扫描下方二维码完成登录
        </p>

        {/* QR code area */}
        <div className="flex items-center justify-center">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!error && !qrUrl && (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
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
