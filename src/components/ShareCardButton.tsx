"use client";

import { useCallback, useState } from "react";

export default function ShareCardButton() {
  const [copying, setCopying] = useState(false);

  const getCanvas = useCallback(async () => {
    const html2canvas = (await import("html2canvas")).default;
    const el = document.getElementById("understanding-card");
    if (!el) return null;
    return html2canvas(el, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ecfdf5",
    });
  }, []);

  const handleDownload = useCallback(async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "明白卡.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [getCanvas]);

  const handleCopy = useCallback(async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    setCopying(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch {
          // Clipboard API may not be available
        } finally {
          setCopying(false);
        }
      }, "image/png");
    } catch {
      setCopying(false);
    }
  }, [getCanvas]);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        下载明白卡
      </button>
      <button
        onClick={handleCopy}
        disabled={copying}
        className="rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-50 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
      >
        {copying ? "复制中…" : "复制到剪贴板"}
      </button>
    </div>
  );
}
