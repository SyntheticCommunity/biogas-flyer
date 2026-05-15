"use client";

import { useState } from "react";

export default function QAPanel() {
  const [question, setQuestion] = useState("");

  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        向本文提问
      </h3>
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入你的问题…"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          disabled
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        >
          提交
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        提问功能即将上线，敬请期待。
      </p>
    </section>
  );
}
