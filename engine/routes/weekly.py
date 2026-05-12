from fastapi import APIRouter, HTTPException
from weekly.planner import get_or_generate_plan, generate_plan

router = APIRouter()


@router.get("/weekly-plan")
async def get_plan():
    try:
        return await get_or_generate_plan()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/weekly-plan/generate")
async def regenerate_plan():
    try:
        return await generate_plan()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
