from datetime import datetime

from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    subtitle: str | None = None
    slug: str
    category: str | None = None
    tags: list[str] | None = None
    slurry_type: str | None = None
    crop: str | None = None
    soil_type: str | None = None
    dosage: str | None = None
    application_method: str | None = None
    yield_benefit: str | None = None
    quality_benefit: str | None = None
    risk_control: str | None = None
    understanding_points: list[str] | None = None
    content_md: str | None = None
    source_citation: str | None = None
    authors: str | None = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    slug: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    slurry_type: str | None = None
    crop: str | None = None
    soil_type: str | None = None
    dosage: str | None = None
    application_method: str | None = None
    yield_benefit: str | None = None
    quality_benefit: str | None = None
    risk_control: str | None = None
    understanding_points: list[str] | None = None
    content_md: str | None = None
    source_citation: str | None = None
    authors: str | None = None


class ArticleRead(ArticleBase):
    id: str
    status: str
    paper_id: str | None = None
    published_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ArticleListItem(BaseModel):
    id: str
    title: str
    subtitle: str | None = None
    slug: str
    category: str | None = None
    status: str
    published_at: datetime | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
