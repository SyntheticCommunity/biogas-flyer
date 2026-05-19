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
      className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-green-950/40"
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-blue-300">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#1E3A5F]/10 text-xs dark:bg-blue-400/10">
          ✦
        </span>
        明白卡要点
      </h3>
      <ul className="space-y-1.5">
        {understanding_points.map((point, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
