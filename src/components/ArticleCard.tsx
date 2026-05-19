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
  水稻: { bg: "bg-blue-50", text: "text-[#2E5A8F]" },
  小麦: { bg: "bg-amber-50", text: "text-amber-700" },
  蔬菜: { bg: "bg-red-50", text: "text-red-700" },
};

export default function ArticleCard({
  title,
  subtitle,
  slug,
  category,
  publishedAt,
}: ArticleCardProps) {
  const colors = category ? categoryColors[category] ?? { bg: "bg-gray-100", text: "text-gray-600" } : null;

  return (
    <Link
      href={`/posts/${slug}`}
      className="group block rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-0.5 shrink-0 rounded bg-[#C4880C] opacity-60 group-hover:opacity-100" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1E3A5F]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {category && colors && (
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                {category}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(publishedAt)}</span>
          </div>
        </div>
        <span className="shrink-0 text-gray-300 transition group-hover:text-[#1E3A5F]">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
