"""Q&A engine for answering user questions about article content via Dashscope Qwen."""

from __future__ import annotations

import logging

from openai import AsyncOpenAI

from biogas.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "你是一位农业科技问答助手。请基于提供的文章内容回答用户问题。"
    "如果文章中没有相关信息，请直接说明文章未提及此内容。不要编造信息。"
)


class QAEngine:
    """Wraps Dashscope Qwen to answer questions grounded in article content."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.dashscope_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )

    async def answer(self, question: str, article_content: str) -> str:
        """Answer a user question based on the given article content.

        Parameters
        ----------
        question:
            The user's question.
        article_content:
            The full markdown content of the article to ground the answer.

        Returns
        -------
        str
            The model's answer.

        Raises
        ------
        RuntimeError
            If the API call fails or returns an empty response.
        """
        user_message = (
            f"以下是文章内容：\n\n{article_content}\n\n"
            f"用户问题：{question}"
        )

        try:
            response = await self._client.chat.completions.create(
                model=settings.dashscope_model,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                max_tokens=2000,
            )
        except Exception as exc:
            raise RuntimeError(f"Dashscope API call failed: {exc}") from exc

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("Dashscope returned an empty response")

        return raw_content


# Singleton instance
qa_engine = QAEngine()
