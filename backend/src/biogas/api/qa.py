"""Article-level Q&A API — answer user questions grounded in article content."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.models.article import Article
from biogas.models.qa import QAMessage
from biogas.schemas.qa import QARequest, QAResponse
from biogas.services.qa_engine import qa_engine

router = APIRouter(prefix="/api/qa", tags=["qa"])


@router.post("", response_model=QAResponse)
async def ask_question(
    body: QARequest,
    db: AsyncSession = Depends(get_db),
) -> QAResponse:
    """Answer a user question about a specific article.

    1. Fetch the article by id.
    2. Persist the user message.
    3. Call the Q&A engine with the article content.
    4. Persist the assistant message.
    5. Return the answer.
    """
    # 1. Get article by id
    result = await db.execute(select(Article).where(Article.id == body.article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    if not article.content_md:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article has no content",
        )

    # 2. Save user message
    user_msg = QAMessage(
        article_id=body.article_id,
        session_id=body.session_id,
        role="user",
        content=body.question,
    )
    db.add(user_msg)
    await db.flush()

    # 3. Call Q&A engine
    answer = await qa_engine.answer(body.question, article.content_md)

    # 4. Save assistant message
    assistant_msg = QAMessage(
        article_id=body.article_id,
        session_id=body.session_id,
        role="assistant",
        content=answer,
    )
    db.add(assistant_msg)
    await db.commit()

    # 5. Return response
    return QAResponse(answer=answer, session_id=body.session_id)
