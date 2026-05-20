interface UnderstandingCardProps {
  slurry_type: string | null;
  dosage: string | null;
  soil_type: string | null;
  crop: string | null;
  application_method: string | null;
  risk_control: string | null;
}

const fields: { key: keyof UnderstandingCardProps; label: string }[] = [
  { key: "slurry_type", label: "沼液类型" },
  { key: "dosage", label: "沼液用量" },
  { key: "crop", label: "试验作物" },
  { key: "soil_type", label: "试验土壤" },
  { key: "application_method", label: "施用方式" },
  { key: "risk_control", label: "风险关注" },
];

export default function UnderstandingCard(props: UnderstandingCardProps) {
  const entries = fields.filter(({ key }) => props[key]);
  if (entries.length === 0) return null;

  return (
    <div
      id="understanding-card"
      className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-green-950/40"
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-blue-300">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#1E3A5F]/10 text-xs dark:bg-blue-400/10">
          ✦
        </span>
        明白卡
      </h3>
      <dl className="space-y-1.5">
        {entries.map(({ key, label }) => (
          <div key={key} className="flex items-start gap-2 text-sm">
            <dt className="shrink-0 font-medium text-[#1E3A5F] dark:text-blue-300">
              {label}：
            </dt>
            <dd className="text-gray-700 dark:text-gray-300">
              {props[key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
