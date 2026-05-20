"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import UnderstandingCard from "@/components/UnderstandingCard";
import LoginDialog from "@/components/LoginDialog";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string | null;
  tags: string[] | null;
  slurry_type: string | null;
  crop: string | null;
  soil_type: string | null;
  dosage: string | null;
  application_method: string | null;
  yield_benefit: string | null;
  quality_benefit: string | null;
  risk_control: string | null;
  understanding_points: string[] | null;
  content_md: string | null;
  source_citation: string | null;
  paper_id: number | null;
  authors: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const user = useAuthStore((s) => s.user);
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ["article", slug],
    queryFn: () => fetchAPI<Article>(`/biogas/articles/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          文章未找到
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          该文章不存在或已被移除。
        </p>
      </div>
    );
  }

  return (
    <>
    <article className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {article.category && (
            <span className="inline-block rounded bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#2E5A8F] dark:bg-blue-950 dark:text-blue-300">
              {article.category}
            </span>
          )}
          <time
            dateTime={article.published_at ?? ""}
            className="text-xs text-gray-400 dark:text-gray-500"
          >
            {formatDate(article.published_at)}
          </time>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            {article.subtitle}
          </p>
        )}

        {article.authors && (
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
            {article.authors}
          </p>
        )}
      </header>

      {/* Understanding Card */}
      <div className="mb-8">
        <UnderstandingCard
          slurry_type={article.slurry_type}
          dosage={article.dosage}
          soil_type={article.soil_type}
          crop={article.crop}
          application_method={article.application_method}
          risk_control={article.risk_control}
        />
      </div>

      {/* Markdown Content */}
      {article.content_md && (
        <div className="prose prose-green max-w-none mb-10 dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content_md}
          </ReactMarkdown>
        </div>
      )}

      {/* Source Citation */}
      {article.source_citation && (
        <div className="mb-10 rounded-xl border border-[#E5E1DB] bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500">原始文献</div>
          {article.paper_id ? (
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                if (user) {
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/biogas/papers/${article.paper_id}/download`,
                      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                    );
                    if (!res.ok) throw new Error("下载失败");
                    const { url: signedUrl } = await res.json();
                    const fileRes = await fetch(signedUrl);
                    const blob = await fileRes.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = "paper.pdf";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                  } catch {
                    alert("下载失败，请稍后重试");
                  }
                } else {
                  setLoginOpen(true);
                }
              }}
              className="mt-1 block text-sm text-[#2E5A8F] hover:underline dark:text-blue-400"
            >
              {article.source_citation}
            </a>
          ) : (
            <span className="mt-1 block text-sm text-gray-400 dark:text-gray-500">
              {article.source_citation}
              <span className="ml-2 text-xs">（暂无原文可下载）</span>
            </span>
          )}
        </div>
      )}

    </article>

    <Footer />
    <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
