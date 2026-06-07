import HeroBanner from "@/components/HeroBanner";
import ArticleSection from "@/components/ArticleSection";
import Footer from "@/components/Footer";

export interface ArticleListItem {
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

async function getArticles(): Promise<{ data: ArticleListItem[] | null; error: string | null }> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.bio-spring.top/api/v1";
    const res = await fetch(`${API_BASE}/biogas/articles`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { data: null, error: `API ${res.status}` };
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export default async function HomePage() {
  const { data: articles, error } = await getArticles();

  return (
    <>
      <HeroBanner />

      {error ? (
        <section className="mx-auto max-w-5xl px-6 py-12 md:px-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            文章加载失败，请稍后再试。
          </div>
        </section>
      ) : (
        <ArticleSection articles={articles ?? []} />
      )}

      <Footer />
    </>
  );
}
