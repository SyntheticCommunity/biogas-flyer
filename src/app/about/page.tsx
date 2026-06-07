import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";

export const metadata = {
  title: "关于 - 沼液还田科普站",
  description: "华中农业大学土壤健康与绿色农业团队",
};

/* ─── Inline SVG icons ─── */
const Icons = {
  Leaf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <path d="M12 2C6 8 4 14 4 18c0 2 1 4 4 4 4 0 8-2 12-8-4 4-8 6-12 4s-2-8 4-16z" />
    </svg>
  ),
  Document: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

/* ─── Contact row helper ─── */
function ContactRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.FC;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-[#1E3A5F]/8 text-[#1E3A5F] dark:bg-blue-400/10 dark:text-blue-300">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500 uppercase">
          {label}
        </div>
        <div className={`mt-0.5 text-sm ${valueClassName ?? "text-gray-700 dark:text-gray-300"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats data ─── */
const stats = [
  { num: "15+", label: "年研究经验", icon: Icons.Leaf },
  { num: "50+", label: "篇学术论文", icon: Icons.Document },
  { num: "30+", label: "示范田基地", icon: Icons.Grid },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero-curve relative bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <div className="mx-auto mb-5 h-[3px] w-10 rounded bg-[#C4880C]" />
          <h1 className="animate-fade-in-up text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            关于我们
          </h1>
          <p className="animation-delay-200 animate-fade-in-up mt-4 text-base text-white/70 md:text-lg">
            科学还田 · 绿色循环 · 乡村振兴
          </p>
        </div>
      </section>

      {/* ─── Content ─── */}
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-20">

        {/* ═══ 团队介绍 ═══ */}
        <section className="mb-20">
          <div className="section-divider mb-5" />
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
            团队介绍
          </h2>
          <p className="mx-auto max-w-2xl text-center leading-relaxed text-gray-500 dark:text-gray-400">
            华中农业大学土壤健康与绿色农业团队长期从事土壤肥力、作物营养与农业废弃物资源化利用研究。
            团队依托华中农业大学资源与环境学院，在沼液还田、有机肥替代化肥等领域积累了丰富的科研成果和实践经验。
          </p>

          {/* 统计数据 */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((item, i) => (
              <div
                key={item.label}
                className={`animation-delay-${(i + 1) * 100} animate-fade-in-up stat-card rounded-xl border border-[#E5E1DB] bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800`}
              >
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#1E3A5F]/8 text-[#C4880C] dark:bg-amber-400/10 dark:text-amber-400">
                  <item.icon />
                </span>
                <div className="text-2xl font-bold text-[#1E3A5F] dark:text-blue-300">{item.num}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>

          {/* 华中农业大学联系方式 */}
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-[#E5E1DB] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                华中农业大学 · 联系
              </div>
              <div className="mx-auto mt-2 h-px w-8 bg-[#E5E1DB] dark:bg-gray-600" />
            </div>
            <div className="space-y-4">
              <ContactRow icon={Icons.User} label="联系人" value="高老师" />
              <ContactRow
                icon={Icons.Mail}
                label="邮箱"
                value="gaoch@mail.hzau.edu.cn"
                valueClassName="text-[#1E3A5F] dark:text-blue-300"
              />
              <ContactRow
                icon={Icons.Pin}
                label="地址"
                value="武汉市洪山区华中农业大学资源与环境学院"
              />
            </div>
            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              如有技术服务需求，欢迎来信洽谈
            </p>
          </div>
        </section>

        {/* ═══ 技术合作方 ═══ */}
        <section className="mb-20">
          <div className="section-divider mb-5" />
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
            技术合作方
          </h2>

          <div className="relative overflow-hidden rounded-2xl border border-[#E5E1DB] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-8">
            {/* 装饰性叶片 */}
            <span className="pointer-events-none absolute -right-6 -top-6 rotate-45 text-[#C4880C]/5 dark:text-amber-400/5">
              <svg viewBox="0 0 80 80" fill="currentColor" className="size-24 md:size-32">
                <path d="M40 2C20 16 10 32 10 44c0 8 3 14 8 18 10 8 22 4 32-8l-8 10c-8 6-18 8-26 2-6-4-10-12-10-22 0-14 8-30 24-42z" />
              </svg>
            </span>

            <div className="relative">
              <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-blue-300">
                湖北长投双新环保科技有限公司
              </h3>
              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
                湖北长投双新环保科技有限公司（简称"长投双新"）成立于2020年，是一家国有控股企业，注册资本4500万元，坐落于襄阳市老河口市温岗村。公司投资1.05亿元建设运营"老河口市农林生物质制气及发电项目"，引进德国半干式混合原料连续厌氧发酵工艺，年处理农业废弃物9.52万吨，将农林畜牧业、市政有机生活垃圾等转化为清洁能源（电力、天然气）及高品位有机肥、基质产品。
              </p>
              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
                在沼气发电、生物天然气、有机肥等业务基础上，公司重点打造沼液还田板块，将厌氧发酵后的沼液转化为安全、高效的液态有机肥。沼液富含氮、磷、钾及多种活性物质，是优质的有机液体肥料，就近服务周边果园、农田，真正实现"养殖—沼气—沼液—种植"的闭环循环。
              </p>
              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
                公司作为湖北省农业废弃物资源化利用重点企业，与华中农业大学资源与环境学院深度合作，共建沼液还田技术指导体系。沼液还田业务已稳定运营2年，与7家客户签订长期消纳合同。2025年全年消纳沼液21,147吨，2026年1—5月消纳量已达20,600吨，消纳规模快速增长。以老河口市洪山嘴地区的桃园、梨园、果园为代表的典型消纳场景，充分验证了沼液还田在果木种植中的实用性与经济性。
              </p>
              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
                沼液还田是长投双新从"能源输出"向"农业服务延伸"的关键布局。通过将废弃物资源化末端产物高效回归土地，公司既解决了沼液消纳难题，也为周边农户提供了低成本、高肥效的有机替代方案，助力农业碳减排与耕地质量提升。
              </p>
            </div>
          </div>

          {/* 长投双新联系方式 */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#E5E1DB] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                长投双新 · 沼液还田联系
              </div>
              <div className="mx-auto mt-2 h-px w-8 bg-[#E5E1DB] dark:bg-gray-600" />
            </div>
            <div className="space-y-4">
              <ContactRow icon={Icons.User} label="联系人" value="徐工" />
              <ContactRow
                icon={Icons.Phone}
                label="电话"
                value="13871739715"
                valueClassName="text-[#1E3A5F] dark:text-blue-300"
              />
              <ContactRow
                icon={Icons.Pin}
                label="地址"
                value="襄阳市老河口市竹林桥镇温岗村（见下方地图）"
              />
            </div>
            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              如有沼液还田需求，欢迎致电咨询
            </p>
          </div>

          {/* 高德地图 */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E1DB] shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-gray-700">
            <div className="flex items-center justify-between bg-white px-5 py-3 dark:bg-gray-800">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Icons.Pin />
                长投双新 · 公司位置
              </span>
              <a
                href="https://uri.amap.com/marker?position=111.784116,32.463949&name=湖北长投双新环保科技有限公司"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#1E3A5F] transition hover:gap-1.5 hover:underline dark:text-blue-300"
              >
                导航到这里
                <Icons.Arrow />
              </a>
            </div>
            <MapSection />
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}
