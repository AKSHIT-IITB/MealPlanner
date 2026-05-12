from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.advisor import router as advisor_router
from routes.weekly import router as weekly_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(advisor_router, prefix="/ai-api")
app.include_router(weekly_router, prefix="/ai-api")


@app.get("/health")
def health():
    return {"status": "ok"}
