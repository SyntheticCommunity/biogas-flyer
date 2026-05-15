"""
Migrate the first Hugo article into the new database.

Reads content/posts/2024-06-rice-slurry/index.md, extracts the body after
the YAML frontmatter, and inserts an Article row with all structured fields.
Skips silently if an article with the same slug already exists.
"""

import asyncio
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from biogas.database import async_session, init_db
from biogas.models.article import Article

# ---------------------------------------------------------------------------
# Source article
# ---------------------------------------------------------------------------
HUGO_MD = (
    Path(__file__).resolve().parent.parent
    / "content"
    / "posts"
    / "2024-06-rice-slurry"
    / "index.md"
)

# ---------------------------------------------------------------------------
# Structured data for the Article record
# ---------------------------------------------------------------------------
ARTICLE_DATA = {
    "title": "猪粪沼液还田：水稻增产提质实战指南",
    "subtitle": "打通种养循环，让化肥钱留在自己口袋里",
    "slug": "pig-slurry-rice-production",
    "category": "水稻",
    "tags": ["沼液还田", "增产", "田间试验", "水稻"],
    "slurry_type": "猪粪沼液",
    "crop": "水稻",
    "soil_type": "水稻土（长江中下游典型水稻土）",
    "dosage": "约 20 吨/亩（纯氮约 8 公斤/亩）",
    "application_method": "分蘖期 + 灌浆期各施用一次",
    "yield_benefit": "比化肥增产约 24%",
    "quality_benefit": "蛋白质含量提升 24%",
    "risk_control": "配套排水沟，避免连续阴雨天施用",
    "understanding_points": [
        "沼液类型：猪粪厌氧发酵沼液",
        "适用作物：水稻",
        "单次用量：约 20 吨/亩",
        "施用时机：分蘖期 + 灌浆期各一次",
        "预期收益：比化肥增产 24%",
        "风险提示：避免连续阴雨天施用",
    ],
    "source_citation": "植物营养与肥料学报 2023, 29(3): 483-495",
    "authors": "华中农业大学土壤健康与绿色农业团队",
    "status": "published",
    "published_at": datetime(2024, 6, 15, tzinfo=timezone.utc),
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def extract_body(markdown_text: str) -> str:
    """Return the markdown body after the YAML frontmatter (delimited by ---)."""
    parts = markdown_text.split("---", 2)
    if len(parts) < 3:
        return markdown_text.strip()
    return parts[2].strip()


# ---------------------------------------------------------------------------
# Main migration coroutine
# ---------------------------------------------------------------------------
async def migrate() -> None:
    # Ensure tables exist
    await init_db()

    # Read source markdown
    md_text = HUGO_MD.read_text(encoding="utf-8")
    body = extract_body(md_text)
    print(f"Read {HUGO_MD}  ({len(body)} chars of body)")

    async with async_session() as session:
        # Skip if slug already present
        existing = await session.execute(
            select(Article).where(Article.slug == ARTICLE_DATA["slug"])
        )
        if existing.scalar_one_or_none() is not None:
            print(f"Article with slug '{ARTICLE_DATA['slug']}' already exists – skipping.")
            return

        article = Article(**ARTICLE_DATA, content_md=body)
        session.add(article)
        await session.commit()
        print(f"Inserted article  id={article.id}  slug={article.slug}")


if __name__ == "__main__":
    asyncio.run(migrate())
