"use client";

import { useMemo, useState } from "react";
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
  crop: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
}

const CROP_FILTERS = [
  "全部",
  "水稻",
  "小麦",
  "玉米",
  "大豆",
  "番茄",
  "白菜",
  "生菜",
  "辣椒",
  "茄子",
  "西瓜",
  "草莓",
  "桃树",
  "樱桃",
  "梨",
  "苹果",
  "葡萄",
  "柑橘",
  "香蕉",
  "马铃薯",
  "红薯",
  "棉花",
  "油菜",
  "花生",
];

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
  const [activeCrop, setActiveCrop] = useState("全部");

  const {
    data: articles,
    isLoading,
    error,
  } = useQuery<ArticleListItem[]>({
    queryKey: ["articles"],
    queryFn: () => fetchAPI<ArticleListItem[]>("/biogas/articles"),
  });

  const cropsInData = useMemo(() => {
    if (!articles) return [];
    const cropSet = new Set<string>();
    for (const a of articles) {
      const c = a.crop || a.category;
      if (c) cropSet.add(c);
    }
    return CROP_FILTERS.filter((f) => f === "全部" || cropSet.has(f));
  }, [articles]);

  const filtered = useMemo(() => {
    if (!articles) return [];
    if (activeCrop === "全部") return articles;
    return articles.filter((a) => {
      const c = a.crop || a.category;
      return c === activeCrop;
    });
  }, [articles, activeCrop]);

  return (
    <>
      <HeroBanner />

      <section id="articles" className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            科普文章
          </h2>
          {articles && articles.length > 0 && (
            <span className="rounded-full bg-[#1E3A5F]/10 px-3 py-0.5 text-xs font-medium text-[#2E5A8F] dark:bg-blue-400/10 dark:text-blue-300">
              {filtered.length} 篇
            </span>
          )}
        </div>

        {cropsInData.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {cropsInData.map((crop) => (
              <button
                key={crop}
                onClick={() => setActiveCrop(crop)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeCrop === crop
                    ? "bg-[#1E3A5F] text-white dark:bg-blue-500 dark:text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        )}

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

        {filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                subtitle={article.subtitle}
                slug={article.slug}
                category={article.crop || article.category}
                publishedAt={article.published_at}
              />
            ))}
          </div>
        )}

        {articles && articles.length > 0 && filtered.length === 0 && (
          <p className="py-12 text-center text-gray-400 dark:text-gray-500">
            该分类下暂无文章。
          </p>
        )}
      </section>

      <Footer />
    </>
  );
}
