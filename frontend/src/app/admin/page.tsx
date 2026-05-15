"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { fetchAPI } from "@/lib/api";
import PaperUpload from "@/components/PaperUpload";

/* ---------- types ---------- */

interface Paper {
  id: string;
  title: string | null;
  authors: string | null;
  journal: string | null;
  year: number | null;
  file_size: number | null;
  status: string;
  error_message: string | null;
  article_id: string | null;
  created_at: string | null;
}

/* ---------- status badge config ---------- */

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  uploaded: {
    label: "已上传",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  processing: {
    label: "处理中",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  completed: {
    label: "已完成",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  failed: {
    label: "失败",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

/* ---------- page ---------- */

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  /* Restore user session from stored token if needed. */
  useEffect(() => {
    if (user || !token) return;

    fetchAPI<{
      id: string;
      name: string | null;
      avatar_url: string | null;
      is_admin: boolean;
    }>("/auth/me")
      .then((u) => setAuth(u, token))
      .catch(() => {
        logout();
        router.replace("/login");
      });
  }, [user, token, setAuth, logout, router]);

  /* Redirect non-admins. */
  useEffect(() => {
    if (user !== null && !isAdmin()) {
      router.replace("/");
    }
  }, [user, isAdmin, router]);

  /* Fetch papers list (only when admin is confirmed). */
  const {
    data: papers,
    isLoading,
    error,
  } = useQuery<Paper[]>({
    queryKey: ["admin-papers"],
    queryFn: () => fetchAPI<Paper[]>("/admin/papers"),
    enabled: !!user && isAdmin(),
  });

  /* Retry mutation for failed papers. */
  const retryMutation = useMutation({
    mutationFn: (paperId: string) =>
      fetchAPI<Paper>(`/papers/${paperId}/process`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-papers"] });
    },
  });

  /* Don't render anything until auth is resolved. */
  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
        论文管理
      </h1>

      {/* Upload section */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          上传新论文
        </h2>
        <PaperUpload />
      </section>

      {/* Papers list */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          所有论文
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            加载论文列表失败，请稍后再试。
          </div>
        )}

        {papers && papers.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            暂无论文，请上传 PDF 文件开始处理。
          </p>
        )}

        {papers && papers.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-medium">文件名</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">上传时间</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {papers.map((paper) => {
                  const cfg = STATUS_CONFIG[paper.status] ?? {
                    label: paper.status,
                    className:
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  };

                  return (
                    <tr
                      key={paper.id}
                      className="bg-white dark:bg-gray-900"
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {paper.title ?? paper.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                        {paper.status === "failed" && paper.error_message && (
                          <span className="ml-2 text-xs text-red-500 dark:text-red-400">
                            {paper.error_message}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {paper.created_at
                          ? new Date(paper.created_at).toLocaleString("zh-CN")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {paper.status === "failed" && (
                          <button
                            onClick={() => retryMutation.mutate(paper.id)}
                            disabled={retryMutation.isPending}
                            className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            重试
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
