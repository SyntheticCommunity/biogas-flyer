import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import Mapped, mapped_column

from biogas.database import Base


class Article(Base):
    __tablename__ = "articles"
    __table_args__ = (Index("ix_articles_status", "status"),)

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(256), nullable=True)
    slug: Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    slurry_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    crop: Mapped[str | None] = mapped_column(String(128), nullable=True)
    soil_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    dosage: Mapped[str | None] = mapped_column(String(128), nullable=True)
    application_method: Mapped[str | None] = mapped_column(String(128), nullable=True)
    yield_benefit: Mapped[str | None] = mapped_column(Text, nullable=True)
    quality_benefit: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_control: Mapped[str | None] = mapped_column(Text, nullable=True)
    understanding_points: Mapped[list | None] = mapped_column(JSON, nullable=True)
    content_md: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_citation: Mapped[str | None] = mapped_column(Text, nullable=True)
    authors: Mapped[str | None] = mapped_column(String(256), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft")
    paper_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("papers.id"), nullable=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
