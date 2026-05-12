from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from weekly.planner import generate_plan

router = APIRouter()


class MealItem(BaseModel):
    name: str
    desc: str = ""


class MealsData(BaseModel):
    breakfast: List[MealItem] = []
    lunch: List[MealItem] = []
    dinner: List[MealItem] = []


@router.post("/weekly-plan/generate")
async def do_generate(meals: MealsData):
    try:
        return generate_plan(meals.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
