export default function Footer() {
  return (
    <footer className="bg-[#142D4A] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">
        <div className="mb-6 h-px bg-white/10" />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-2 md:gap-16">
          <div>
            <h4 className="mb-3 text-xs font-semibold text-white/70">学术支持</h4>
            <p className="text-sm text-white/50">华中农业大学</p>
            <p className="text-sm text-white/50">土壤健康与绿色农业团队</p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold text-white/70">技术合作</h4>
            <p className="text-sm text-white/50">湖北长投双新</p>
            <p className="text-sm text-white/50">环保科技有限公司</p>
          </div>
        </div>
        <div className="mt-6 h-px bg-white/10" />
        <p className="mt-4 text-center text-xs text-white/30">
          &copy; 2026 华中农业大学土壤健康与绿色农业团队
        </p>
      </div>
    </footer>
  );
}
