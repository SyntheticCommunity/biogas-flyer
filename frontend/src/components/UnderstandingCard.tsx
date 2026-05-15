interface UnderstandingCardProps {
  understanding_points: string[] | null;
}

export default function UnderstandingCard({
  understanding_points,
}: UnderstandingCardProps) {
  if (!understanding_points || understanding_points.length === 0) return null;

  return (
    <div
      id="understanding-card"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950"
    >
      <h3 className="mb-4 text-lg font-bold text-emerald-900 dark:text-emerald-100">
        📌 明白卡要点
      </h3>
      <ul className="space-y-2">
        {understanding_points.map((point, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-200"
          >
            <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
