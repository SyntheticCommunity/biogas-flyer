"use client";

import { useCallback, useState } from "react";
import { fetchAPI } from "@/lib/api";

interface ShareCardButtonProps {
  articleId: string;
  articleSlug: string;
  shareImageUrl: string | null;
}

export default function ShareCardButton({
  articleId,
  articleSlug,
  shareImageUrl: initialUrl,
}: ShareCardButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialUrl);

  const downloadImage = useCallback(
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "明白卡.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    },
    [],
  );

  const handleDownload = useCallback(async () => {
    // If image already exists, download directly
    if (imageUrl) {
      setDownloading(true);
      try {
        await downloadImage(imageUrl);
      } catch {
        alert("下载失败，请稍后重试");
      } finally {
        setDownloading(false);
      }
      return;
    }

    // Trigger generation
    setDownloading(true);
    try {
      await fetchAPI(`/biogas/articles/${articleId}/share-image`, {
        method: "POST",
      });

      // Poll until share_image_url appears
      const deadline = Date.now() + 60_000;
      let url: string | null = null;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));
        const updated = await fetchAPI<{ share_image_url: string | null }>(
          `/biogas/articles/${articleSlug}`,
        );
        if (updated.share_image_url) {
          url = updated.share_image_url;
          break;
        }
      }
      if (url) {
        setImageUrl(url);
        await downloadImage(url);
      } else {
        alert("图片生成中，请稍后再试");
      }
    } catch {
      alert("图片生成失败，请稍后重试");
    } finally {
      setDownloading(false);
    }
  }, [articleId, imageUrl, downloadImage]);

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
        disabled={downloading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        {downloading ? "生成中…" : "下载明白卡"}
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
