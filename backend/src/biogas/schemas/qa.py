from pydantic import BaseModel


class QARequest(BaseModel):
    article_id: str
    session_id: str
    question: str


class QAResponse(BaseModel):
    answer: str
    session_id: str
