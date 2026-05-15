"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

/* ---------- helpers ---------- */

/** Upload a PDF file as multipart/form-data (bypasses fetchAPI's JSON Content-Type). */
async function uploadPaperFile(file: File): Promise<{ id: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/papers/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`上传失败: ${body || res.statusText}`);
  }

  return res.json() as Promise<{ id: string }>;
}

/* ---------- types ---------- */

interface UploadItem {
  key: string; // unique key for React list
  file: File;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

/* ---------- status badge helpers ---------- */

const STATUS_MAP: Record<
  UploadItem["status"],
  { text: string; cls: string }
> = {
  uploading: {
    text: "上传中...",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  processing: {
    text: "处理中...",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  done: {
    text: "完成",
    cls: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  error: {
    text: "失败",
    cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

/* ---------- component ---------- */

export default function PaperUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const nextKey = useRef(0);

  /* Mutation: trigger paper processing after upload */
  const processMutation = useMutation({
    mutationFn: (paperId: string) =>
      fetchAPI<{ id: string }>(`/papers/${paperId}/process`, {
        method: "POST",
      }),
  });

  /** Update a single upload item by its key. */
  const updateUpload = useCallback(
    (key: string, patch: Partial<UploadItem>) => {
      setUploads((prev) =>
        prev.map((u) => (u.key === key ? { ...u, ...patch } : u)),
      );
    },
    [],
  );

  /** Handle an array of PDF files: upload then process each. */
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter(
        (f) =>
          f.type === "application/pdf" ||
          f.name.toLowerCase().endsWith(".pdf"),
      );

      if (pdfFiles.length === 0) return;

      const newItems: UploadItem[] = pdfFiles.map((file) => ({
        key: `upload-${nextKey.current++}`,
        file,
        status: "uploading",
      }));

      setUploads((prev) => [...newItems, ...prev]);

      // Fire-and-forget promise chain for each file
      for (const item of newItems) {
        uploadPaperFile(item.file)
          .then(({ id }) => {
            updateUpload(item.key, { status: "processing" });
            return processMutation.mutateAsync(id);
          })
          .then(() => {
            updateUpload(item.key, { status: "done" });
            queryClient.invalidateQueries({ queryKey: ["admin-papers"] });
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "未知错误";
            updateUpload(item.key, { status: "error", error: msg });
          });
      }
    },
    [processMutation, queryClient, updateUpload],
  );

  /* ---------- drag-and-drop handlers ---------- */

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  /* ---------- render ---------- */

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950"
            : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            拖拽 PDF 文件到此处，或点击选择
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            支持批量上传，仅接受 PDF 格式
          </p>
        </div>
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((item) => {
            const info = STATUS_MAP[item.status];
            return (
              <li
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="mr-3 truncate text-sm text-gray-700 dark:text-gray-200">
                  {item.file.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${info.cls}`}
                >
                  {item.status === "error" && item.error
                    ? `${info.text} ${item.error}`
                    : info.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
