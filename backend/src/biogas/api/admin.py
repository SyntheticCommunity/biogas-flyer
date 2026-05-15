"""Admin API — manage papers and articles (admin only)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.api.deps import require_admin
from biogas.database import get_db
from biogas.models.article import Article
from biogas.models.paper import Paper
from biogas.models.user import User
from biogas.schemas.article import ArticleRead, ArticleUpdate
from biogas.schemas.paper import PaperRead

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/papers", response_model=list[PaperRead])
async def list_papers(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[Paper]:
    """Return all papers (admin only)."""
    result = await db.execute(select(Paper).order_by(Paper.created_at.desc()))
    return list(result.scalars().all())


@router.get("/articles", response_model=list[ArticleRead])
async def list_all_articles(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[Article]:
    """Return all articles including drafts (admin only)."""
    result = await db.execute(select(Article).order_by(Article.created_at.desc()))
    return list(result.scalars().all())


@router.put("/articles/{article_id}", response_model=ArticleRead)
async def update_article(
    article_id: str,
    payload: ArticleUpdate,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Article:
    """Update article fields (admin only)."""
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)

    await db.commit()
    await db.refresh(article)
    return article
