"""arq background task: parse a paper PDF and generate a published article."""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone

from biogas.database import async_session
from biogas.models import Article, Paper
from biogas.services.ai_pipeline import ai_pipeline
from biogas.services.pdf_parser import pdf_parser
from sqlalchemy import select

logger = logging.getLogger(__name__)


def make_slug(title: str) -> str:
    """Convert a title to a URL-safe slug.

    - Lowercase
    - Replace non-alphanumeric characters (except hyphens) with hyphens
    - Collapse consecutive hyphens
    - Trim leading/trailing hyphens
    - Truncate to 100 characters
    """
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9一-鿿-]", "-", slug)  # keep CJK chars
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug[:100]


async def process_paper(paper_id: str) -> None:
    """End-to-end paper processing pipeline.

    Steps:
        1. Parse PDF via MinerU
        2. Generate structured interpretation via AI (Dashscope Qwen)
        3. Create an Article and link it to the Paper
    """
    async with async_session() as db:
        # ----------------------------------------------------------
        # Fetch the paper record
        # ----------------------------------------------------------
        result = await db.execute(select(Paper).where(Paper.id == paper_id))
        paper = result.scalar_one_or_none()
        if paper is None:
            raise ValueError(f"Paper not found: {paper_id}")

        try:
            paper.status = "processing"
            await db.commit()

            # ----------------------------------------------------------
            # Step 1 – Parse PDF
            # ----------------------------------------------------------
            logger.info("Step 1: Parsing PDF for paper %s", paper_id)
            parsed_content = await pdf_parser.parse(paper_id, paper.file_path)
            paper.parsed_path = f"papers/{paper_id}/parsed.md"
            await db.commit()

            # ----------------------------------------------------------
            # Step 2 – AI interpretation
            # ----------------------------------------------------------
            logger.info("Step 2: Running AI interpretation for paper %s", paper_id)
            ai_result = await ai_pipeline.interpret_paper(parsed_content)

            # ----------------------------------------------------------
            # Step 3 – Create Article from structured AI result
            # ----------------------------------------------------------
            logger.info("Step 3: Creating article for paper %s", paper_id)
            article_title = ai_result["title"]
            article = Article(
                title=article_title,
                subtitle=ai_result.get("subtitle"),
                slug=make_slug(article_title),
                category=ai_result.get("category"),
                tags=ai_result.get("tags"),
                slurry_type=ai_result.get("slurry_type"),
                crop=ai_result.get("crop"),
                soil_type=ai_result.get("soil_type"),
                dosage=ai_result.get("dosage"),
                application_method=ai_result.get("application_method"),
                yield_benefit=ai_result.get("yield_benefit"),
                quality_benefit=ai_result.get("quality_benefit"),
                risk_control=ai_result.get("risk_control"),
                understanding_points=ai_result.get("understanding_points"),
                content_md=ai_result.get("full_article_md"),
                source_citation=ai_result.get("source_citation"),
                authors=ai_result.get("authors"),
                status="published",
                paper_id=paper.id,
                published_at=datetime.now(timezone.utc),
            )
            db.add(article)
            await db.flush()  # assign article.id before referencing it

            # Link paper -> article
            paper.article_id = article.id
            paper.status = "completed"
            await db.commit()

            logger.info(
                "Paper %s processed successfully. Article %s created.",
                paper_id,
                article.id,
            )

        except Exception as exc:
            # Mark paper as failed and persist the error
            paper.status = "failed"
            paper.error_message = str(exc)
            await db.commit()
            logger.error("Paper %s processing failed: %s", paper_id, exc)
            raise


# ---------------------------------------------------------------------------
# arq Worker settings
# ---------------------------------------------------------------------------
class WorkerSettings:
    """arq worker configuration.

    Usage::

        arq biogas.tasks.process_paper.WorkerSettings
    """

    functions = [process_paper]
