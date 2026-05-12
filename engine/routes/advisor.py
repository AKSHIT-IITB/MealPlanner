from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from rag.advisor import stream_advice
from rag.vectorstore import sync_meals

router = APIRouter()


class AskBody(BaseModel):
    query: str
    meal_type: str | None = None


@router.post("/ask")
async def ask(body: AskBody):
    return StreamingResponse(
        stream_advice(body.query, body.meal_type),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )


@router.post("/sync")
async def sync():
    count = await sync_meals()
    return {"synced": count}
