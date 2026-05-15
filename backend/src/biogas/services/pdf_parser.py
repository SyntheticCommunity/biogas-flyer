"""MinerU PDF parser service with OSS caching."""

from __future__ import annotations

import logging
import os
import subprocess
import tempfile
from pathlib import Path

from biogas.config import settings
from biogas.services.oss import oss_service

logger = logging.getLogger(__name__)


class PDFParser:
    """Wraps MinerU CLI to parse academic PDFs into markdown.

    Results are cached on OSS at ``papers/{paper_id}/parsed.md`` to avoid
    redundant parsing.
    """

    async def parse(self, paper_id: str, oss_key: str) -> str:
        """Parse a PDF stored on OSS and return the markdown content.

        Parameters
        ----------
        paper_id:
            Unique identifier for the paper (used for caching).
        oss_key:
            OSS object key of the source PDF.

        Returns
        -------
        str
            The parsed markdown content.
        """
        cache_key = f"papers/{paper_id}/parsed.md"

        # 1. Check for cached result
        try:
            cached = await oss_service.download_bytes(cache_key)
            content = cached.decode("utf-8")
            logger.info("Using cached parsed result for paper %s", paper_id)
            return content
        except Exception:
            # Object does not exist or download failed – proceed with parsing
            logger.debug("No cache found for paper %s, parsing PDF", paper_id)

        tmp_dir: str | None = None
        output_dir: str | None = None
        try:
            # 2. Download PDF from OSS to a temp file
            tmp_dir = tempfile.mkdtemp(prefix="mineru_")
            pdf_path = os.path.join(tmp_dir, "input.pdf")
            pdf_bytes = await oss_service.download_bytes(oss_key)
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)

            # 3. Run MinerU CLI
            output_dir = os.path.join(tmp_dir, "output")
            os.makedirs(output_dir, exist_ok=True)

            cmd = [
                "magic-pdf",
                "-p", pdf_path,
                "-o", output_dir,
                "-m", settings.mineru_model_size,
            ]
            logger.info("Running MinerU: %s", " ".join(cmd))
            result = subprocess.run(
                cmd,
                timeout=300,
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise RuntimeError(
                    f"MinerU failed (exit {result.returncode}): {result.stderr}"
                )

            # 4. Read generated markdown from output directory
            # MinerU may place output at:
            #   {output_dir}/{pdf_name}/{pdf_name}.md  or
            #   {output_dir}/auto/{pdf_name}.md
            # We search for any .md file in the output tree.
            md_content = self._read_output_markdown(output_dir)

            # 5. Cache result to OSS
            await oss_service.upload_bytes(cache_key, md_content.encode("utf-8"))
            logger.info("Cached parsed result for paper %s", paper_id)

            return md_content

        except subprocess.TimeoutExpired as exc:
            raise RuntimeError("MinerU timed out after 300 s") from exc
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(f"PDF parsing failed: {exc}") from exc
        finally:
            # 6. Clean up temp files
            if tmp_dir and os.path.isdir(tmp_dir):
                import shutil

                shutil.rmtree(tmp_dir, ignore_errors=True)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _read_output_markdown(output_dir: str) -> str:
        """Walk the MinerU output directory and return the first .md file content."""
        for root, _dirs, files in os.walk(output_dir):
            for fname in files:
                if fname.endswith(".md"):
                    md_path = os.path.join(root, fname)
                    with open(md_path, "r", encoding="utf-8") as f:
                        return f.read()
        raise RuntimeError(
            f"No markdown file found in MinerU output directory: {output_dir}"
        )


# Singleton instance
pdf_parser = PDFParser()
