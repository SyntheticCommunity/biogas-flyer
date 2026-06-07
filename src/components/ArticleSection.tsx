"use client";

import { useMemo, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleListItem } from "@/app/page";

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

export default function ArticleSection({ articles }: { articles: ArticleListItem[] }) {
  const [activeCrop, setActiveCrop] = useState("全部");

  const cropsInData = useMemo(() => {
    const cropSet = new Set<string>();
    for (const a of articles) {
      const c = a.crop || a.category;
      if (c) cropSet.add(c);
    }
    return CROP_FILTERS.filter((f) => f === "全部" || cropSet.has(f));
  }, [articles]);

  const filtered = useMemo(() => {
    if (activeCrop === "全部") return articles;
    return articles.filter((a) => {
      const c = a.crop || a.category;
      return c === activeCrop;
    });
  }, [articles, activeCrop]);

  return (
    <section id="articles" className="mx-auto max-w-5xl px-6 py-12 md:px-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          科普文章
        </h2>
        {articles.length > 0 && (
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

      {articles.length === 0 && (
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

      {articles.length > 0 && filtered.length === 0 && (
        <p className="py-12 text-center text-gray-400 dark:text-gray-500">
          该分类下暂无文章。
        </p>
      )}
    </section>
  );
}
