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

export default function ArticleCard({
  title,
  subtitle,
  slug,
  category,
  publishedAt,
}: ArticleCardProps) {
  return (
    <Link
      href={`/posts/${slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-center gap-2">
        {category && (
          <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            {category}
          </span>
        )}
        <span className="text-xs text-gray-400">{formatDate(publishedAt)}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-green-700 dark:text-gray-100">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </Link>
  );
}
