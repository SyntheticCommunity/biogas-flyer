import Footer from "@/components/Footer";

export const metadata = {
  title: "关于 - 沼液还田科普站",
  description: "华中农业大学土壤健康与绿色农业团队",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E3A5F] to-[#2E5A8F] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
          <div className="mx-auto mb-4 h-[3px] w-8 rounded bg-[#C4880C]" />
          <h1 className="text-3xl font-bold md:text-4xl">关于我们</h1>
          <p className="mt-3 text-base text-white/70">科学还田 · 绿色循环 · 乡村振兴</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-12">
        {/* 团队介绍 */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">团队介绍</h2>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            华中农业大学土壤健康与绿色农业团队长期从事土壤肥力、作物营养与农业废弃物资源化利用研究。
            团队依托华中农业大学资源与环境学院，在沼液还田、有机肥替代化肥等领域积累了丰富的科研成果和实践经验。
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { num: "15+", label: "年研究经验" },
              { num: "50+", label: "篇学术论文" },
              { num: "30+", label: "示范田基地" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#E5E1DB] bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="text-2xl font-bold text-[#1E3A5F] dark:text-blue-300">{item.num}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 技术合作方 */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">技术合作方</h2>
          <div className="rounded-xl border border-[#E5E1DB] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-blue-300">
              湖北长投双新环保科技有限公司
            </h3>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
              湖北省农业废弃物资源化利用重点企业，专注于沼气工程、沼液处理与还田技术推广。
              公司与华中农业大学深度合作，将科研成果转化为可落地的农业生产方案，助力绿色循环农业发展。
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              业务范围：沼液处理 &middot; 还田方案设计 &middot; 技术培训 &middot; 示范推广
            </p>
          </div>
        </section>

        {/* 联系方式 */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">联系我们</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm space-y-4 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">邮箱</div>
                <div className="text-sm text-[#1E3A5F] dark:text-blue-300">slurry@hzau.edu.cn</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">电话</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">027-8728-XXXX</div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm space-y-4 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">地址</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  武汉市洪山区华中农业大学资源与环境学院
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">网站</div>
                <div className="text-sm text-[#1E3A5F] dark:text-blue-300">biogas.bio-spring.top</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
