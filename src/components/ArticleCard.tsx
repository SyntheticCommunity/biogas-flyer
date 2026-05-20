import Link from "next/link";

interface ArticleCardProps {
  title: string;
  subtitle?: string | null;
  slug: string;
  category?: string | null;
  publishedAt?: string | null;
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  水稻: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-[#2E5A8F] dark:text-blue-300" },
  小麦: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  玉米: { bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300" },
  大豆: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-300" },
  番茄: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
  桃树: { bg: "bg-pink-50 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300" },
  樱桃: { bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300" },
};

export default function ArticleCard({
  title,
  subtitle,
  slug,
  category,
  publishedAt,
}: ArticleCardProps) {
  const colors = category ? categoryColors[category] ?? { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" } : null;

  return (
    <Link
      href={`/posts/${slug}`}
      className="group block rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-0.5 shrink-0 rounded bg-[#C4880C] opacity-60 group-hover:opacity-100" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1E3A5F] dark:text-gray-100 dark:group-hover:text-blue-300">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {category && colors && (
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                {category}
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(publishedAt)}</span>
          </div>
        </div>
        <span className="shrink-0 text-gray-300 transition group-hover:text-[#1E3A5F] dark:text-gray-600 dark:group-hover:text-blue-300">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
