import json
from groq import Groq
from rag.vectorstore import search_meals
from config import GROQ_API_KEY

SYSTEM_PROMPT = """You are a meal planning helper for a personal meal planner app.
Only recommend meals from the list given to you.
Keep your response short, 2-3 sentences max.
If nothing matches what the user wants, just say so honestly."""


def build_prompt(query, meals):
    if not meals:
        return "No meals found in the database.\n\nUser question: " + query

    meal_text = ""
    for m in meals:
        meal_text += f"- {m['name']} ({m['type']}): {m['desc']}\n"

    return f"Here are meals from the user's database:\n{meal_text}\nQuestion: {query}\n\nSuggest the best match from above."


async def stream_advice(query, meal_type=None):
    meals = search_meals(query, meal_type=meal_type, n=5)
    prompt = build_prompt(query, meals)

    try:
        client = Groq(api_key=GROQ_API_KEY)

        stream = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=300
        )

        for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                # replace newlines so SSE stays on one line
                yield "data: " + text.replace("\n", "__NL__") + "\n\n"

        yield "data: __SOURCES__:" + json.dumps(meals) + "\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        print(f"AI streaming error: {e}")
        yield "data: Sorry, something went wrong. Please try again.\n\n"
        yield "data: [DONE]\n\n"
