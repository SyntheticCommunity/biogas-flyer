"""Papers API — upload PDF, trigger processing, get status."""

from __future__ import annotations

import asyncio
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.api.deps import require_admin
from biogas.database import get_db
from biogas.models.paper import Paper
from biogas.models.user import User
from biogas.schemas.paper import PaperRead
from biogas.services.oss import oss_service

router = APIRouter(prefix="/api/papers", tags=["papers"])

# Prefix for OSS keys
_OSS_PREFIX = "papers/"


@router.post("/upload", response_model=PaperRead, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    file: UploadFile,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Paper:
    """Upload a PDF paper (admin only).

    Saves the file to OSS and creates a Paper record.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only PDF files are accepted",
        )

    file_bytes = await file.read()
    paper_id = str(uuid.uuid4())
    oss_key = f"{_OSS_PREFIX}{paper_id}/{file.filename}"

    await oss_service.upload_bytes(oss_key, file_bytes)

    paper = Paper(
        id=paper_id,
        file_path=oss_key,
        file_size=len(file_bytes),
        status="uploaded",
    )
    db.add(paper)
    await db.commit()
    await db.refresh(paper)
    return paper


@router.post("/{paper_id}/process", response_model=PaperRead)
async def process_paper_endpoint(
    paper_id: str,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Paper:
    """Trigger background processing of a paper (admin only).

    Sets status to 'processing' and launches a background task.
    """
    result = await db.execute(select(Paper).where(Paper.id == paper_id))
    paper = result.scalar_one_or_none()
    if paper is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found",
        )

    if paper.status not in ("uploaded", "failed"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Paper is already in status '{paper.status}'",
        )

    paper.status = "processing"
    paper.error_message = None
    await db.commit()
    await db.refresh(paper)

    # Launch background processing task (lazy import to avoid circular deps).
    # The actual process_paper function will be implemented in Task 8.
    try:
        from biogas.services.pipeline import process_paper  # type: ignore[import-not-found]

        asyncio.create_task(process_paper(paper_id))
    except ImportError:
        pass  # pipeline not yet implemented; status stays "processing"

    return paper


@router.get("/{paper_id}", response_model=PaperRead)
async def get_paper(
    paper_id: str,
    db: AsyncSession = Depends(get_db),
) -> Paper:
    """Return paper status (public endpoint)."""
    result = await db.execute(select(Paper).where(Paper.id == paper_id))
    paper = result.scalar_one_or_none()
    if paper is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found",
        )
    return paper
