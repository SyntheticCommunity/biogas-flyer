from datetime import datetime

from pydantic import BaseModel


class PaperRead(BaseModel):
    id: str
    title: str | None = None
    authors: str | None = None
    journal: str | None = None
    year: int | None = None
    file_size: int | None = None
    status: str
    error_message: str | None = None
    article_id: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
