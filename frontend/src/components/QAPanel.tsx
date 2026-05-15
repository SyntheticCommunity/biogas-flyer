"use client";

import { useState, useRef, useEffect } from "react";
import { fetchAPI } from "@/lib/api";

interface QAPanelProps {
  articleId: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function QAPanel({ articleId }: QAPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetchAPI<{ answer: string; session_id: string }>(
        "/biogas/qa",
        {
          method: "POST",
          body: JSON.stringify({
            article_id: articleId,
            session_id: sessionId,
            question: q,
          }),
        },
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "请求失败，请稍后再试。";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `抱歉，${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        向本文提问
      </h3>

      {/* Messages area */}
      {messages.length > 0 && (
        <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-800 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce [animation-delay:0ms]">.</span>
                  <span className="animate-bounce [animation-delay:150ms]">.</span>
                  <span className="animate-bounce [animation-delay:300ms]">.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入你的问题…"
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          提交
        </button>
      </form>
    </section>
  );
}
