"""Public articles API — list published articles and get by slug."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.models.article import Article
from biogas.schemas.article import ArticleListItem, ArticleRead

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=list[ArticleListItem])
async def list_articles(db: AsyncSession = Depends(get_db)) -> list[Article]:
    """Return published articles ordered by published_at descending."""
    result = await db.execute(
        select(Article)
        .where(Article.status == "published")
        .order_by(Article.published_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{slug}", response_model=ArticleRead)
async def get_article(slug: str, db: AsyncSession = Depends(get_db)) -> Article:
    """Return a single published article by slug, or 404."""
    result = await db.execute(
        select(Article).where(Article.slug == slug, Article.status == "published")
    )
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    return article
