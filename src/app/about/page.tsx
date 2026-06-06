import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";

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
              湖北长投双新环保科技有限公司（简称"长投双新"）成立于2020年，是一家国有控股企业，注册资本4500万元，坐落于襄阳市老河口市温岗村。公司投资1.05亿元建设运营"老河口市农林生物质制气及发电项目"，引进德国半干式混合原料连续厌氧发酵工艺，年处理农业废弃物9.52万吨，将农林畜牧业、市政有机生活垃圾等转化为清洁能源（电力、天然气）及高品位有机肥、基质产品。
            </p>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
              在沼气发电、生物天然气、有机肥等业务基础上，公司重点打造沼液还田板块，将厌氧发酵后的沼液转化为安全、高效的液态有机肥。沼液富含氮、磷、钾及多种活性物质，是优质的有机液体肥料，就近服务周边果园、农田，真正实现"养殖—沼气—沼液—种植"的闭环循环。
            </p>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
              公司作为湖北省农业废弃物资源化利用重点企业，与华中农业大学资源与环境学院深度合作，共建沼液还田技术指导体系。沼液还田业务已稳定运营2年，与7家客户签订长期消纳合同。2025年全年消纳沼液21,147吨，2026年1—5月消纳量已达20,600吨，消纳规模快速增长。以老河口市洪山嘴地区的桃园、梨园、果园为代表的典型消纳场景，充分验证了沼液还田在果木种植中的实用性与经济性。
            </p>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
              沼液还田是长投双新从"能源输出"向"农业服务延伸"的关键布局。通过将废弃物资源化末端产物高效回归土地，公司既解决了沼液消纳难题，也为周边农户提供了低成本、高肥效的有机替代方案，助力农业碳减排与耕地质量提升。
            </p>
          </div>
        </section>

        {/* 联系方式 */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">联系我们</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm space-y-4 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">联系人</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">高老师</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">邮箱</div>
                <div className="text-sm text-[#1E3A5F] dark:text-blue-300">gaoch@mail.hzau.edu.cn</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">地址</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  武汉市洪山区华中农业大学资源与环境学院
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E1DB] bg-white p-5 shadow-sm space-y-4 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">联系人（长投双新·沼液还田）</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">徐工</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">电话</div>
                <div className="text-sm text-[#1E3A5F] dark:text-blue-300">13871739715</div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                如有沼液还田需求，欢迎致电咨询
              </p>
            </div>
          </div>

          {/* 高德地图 */}
          <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E1DB] shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between bg-white px-5 py-3 dark:bg-gray-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                长投双新 · 公司位置
              </span>
              <a
                href="https://uri.amap.com/marker?position=111.784116,32.463949&name=湖北长投双新环保科技有限公司"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1E3A5F] hover:underline dark:text-blue-300"
              >
                导航到这里 →
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
