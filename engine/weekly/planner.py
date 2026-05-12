import json
from datetime import date, timedelta
from pathlib import Path
import httpx
from groq import Groq
from config import GROQ_API_KEY, EXPRESS_API_URL

PLAN_FILE = Path("./weekly_plan.json")


def get_monday():
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    return monday.isoformat()


def load_plan():
    if PLAN_FILE.exists():
        try:
            return json.loads(PLAN_FILE.read_text())
        except:
            return None
    return None


def save_plan(plan):
    PLAN_FILE.write_text(json.dumps(plan, indent=2))


async def generate_plan():
    print("Generating weekly meal plan...")

    # get all meals from express
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(EXPRESS_API_URL + "/meals/sync-source")
        res.raise_for_status()
        data = res.json()

    meal_lines = []
    for meal_type in ["breakfast", "lunch", "dinner"]:
        names = [m["name"] for m in data.get(meal_type, [])]
        if names:
            meal_lines.append(meal_type.capitalize() + ": " + ", ".join(names))

    if not meal_lines:
        raise ValueError("No meals in the database. Please add some meals first.")

    week_start = get_monday()
    days = []
    labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for i in range(7):
        d = (date.fromisoformat(week_start) + timedelta(days=i)).isoformat()
        days.append(d)

    prompt = f"""Make a 7-day meal plan using ONLY these meals:

{chr(10).join(meal_lines)}

Rules:
- Only use meal names from the list above
- No meal should repeat more than twice
- Return only valid JSON, no extra text

Format:
{{
  "weekStart": "{week_start}",
  "days": [
    {{"date": "{days[0]}", "label": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[1]}", "label": "Tuesday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[2]}", "label": "Wednesday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[3]}", "label": "Thursday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[4]}", "label": "Friday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[5]}", "label": "Saturday", "breakfast": "...", "lunch": "...", "dinner": "..."}},
    {{"date": "{days[6]}", "label": "Sunday", "breakfast": "...", "lunch": "...", "dinner": "..."}}
  ]
}}"""

    client = Groq(api_key=GROQ_API_KEY)
    res = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    raw = res.choices[0].message.content.strip()

    # sometimes llama wraps in code blocks
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    plan = json.loads(raw)
    save_plan(plan)
    print(f"Plan saved for week of {week_start}")
    return plan


async def get_or_generate_plan():
    plan = load_plan()
    if plan:
        return plan
    return await generate_plan()
