"use client";

import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/HeroBanner";
import ArticleCard from "@/components/ArticleCard";
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
          className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: articles, isLoading, error } = useQuery<ArticleListItem[]>({
    queryKey: ["articles"],
    queryFn: () => fetchAPI<ArticleListItem[]>("/articles"),
  });

  return (
    <>
      <HeroBanner />

      <section id="articles" className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          最新文章
        </h2>

        {isLoading && <ArticleListSkeleton />}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            文章加载失败，请稍后再试。
          </div>
        )}

        {articles && articles.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
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
    </>
  );
}
