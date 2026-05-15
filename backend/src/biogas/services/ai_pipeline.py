"""AI pipeline for interpreting academic papers via Dashscope Qwen."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

from openai import AsyncOpenAI

from biogas.config import settings

logger = logging.getLogger(__name__)

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "paper_interpretation.txt"


class AIPipeline:
    """Wraps Dashscope Qwen to interpret parsed paper text into structured JSON."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.dashscope_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        self._prompt_template = _PROMPT_PATH.read_text(encoding="utf-8")

    async def interpret_paper(self, paper_content: str) -> dict:
        """Send paper text to Qwen and return structured interpretation.

        Parameters
        ----------
        paper_content:
            The full markdown text of the parsed paper (from MinerU).

        Returns
        -------
        dict
            Structured JSON with title, understanding_points, full_article_md, etc.

        Raises
        ------
        RuntimeError
            If the API call fails or the response cannot be parsed as JSON.
        """
        user_message = self._prompt_template.replace("{paper_content}", paper_content)

        try:
            response = await self._client.chat.completions.create(
                model=settings.dashscope_model,
                messages=[
                    {"role": "system", "content": "你是一位农业废弃物资源化利用领域的科普专家。请严格按照指定JSON格式输出。"},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
            )
        except Exception as exc:
            raise RuntimeError(f"Dashscope API call failed: {exc}") from exc

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("Dashscope returned an empty response")

        return self._parse_json(raw_content)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json(raw: str) -> dict:
        """Extract and parse JSON from the model response.

        Handles the case where the AI wraps output in ```json ... ``` blocks.
        """
        # Try to extract from markdown code block first
        match = re.search(r"```json\s*\n?(.*?)\n?\s*```", raw, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
        else:
            # Fall back to the entire content – strip whitespace
            json_str = raw.strip()

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as exc:
            # Last resort: find the outermost { ... }
            brace_match = re.search(r"\{.*\}", json_str, re.DOTALL)
            if brace_match:
                try:
                    return json.loads(brace_match.group(0))
                except json.JSONDecodeError:
                    pass
            raise RuntimeError(
                f"Failed to parse AI response as JSON: {exc}\n"
                f"Raw content (first 500 chars): {raw[:500]}"
            ) from exc


# Singleton instance
ai_pipeline = AIPipeline()
