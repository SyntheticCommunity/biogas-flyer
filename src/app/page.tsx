"use client";

import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/HeroBanner";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { fetchAPI } from "@/lib/api";

interface ArticleListItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
}

function ArticleListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-[#E5E1DB] bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: articles, isLoading, error } = useQuery<ArticleListItem[]>({
    queryKey: ["articles"],
    queryFn: () => fetchAPI<ArticleListItem[]>("/biogas/articles"),
  });

  return (
    <>
      <HeroBanner />

      <section id="articles" className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">科普文章</h2>
          {articles && articles.length > 0 && (
            <span className="rounded-full bg-[#1E3A5F]/10 px-3 py-0.5 text-xs font-medium text-[#2E5A8F] dark:bg-blue-400/10 dark:text-blue-300">
              {articles.length} 篇
            </span>
          )}
        </div>

        {isLoading && <ArticleListSkeleton />}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            文章加载失败，请稍后再试。
          </div>
        )}

        {articles && articles.length === 0 && (
          <p className="py-12 text-center text-gray-400 dark:text-gray-500">
            暂无已发布文章，敬请期待。
          </p>
        )}

        {articles && articles.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                subtitle={article.subtitle}
                slug={article.slug}
                category={article.category}
                publishedAt={article.published_at}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
