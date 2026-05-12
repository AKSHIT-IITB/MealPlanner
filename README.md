# Meal Planner Buddy

A full-stack meal planning app with AI features. Users can sign up, manage their personal meal library, get daily suggestions, ask an AI advisor for meal recommendations, and generate a 7-day meal plan using Llama AI.

## Features

- **Auth** — Register and login with JWT. Each user gets their own meal library.
- **My Meals** — Add, delete, and mark favorite meals across breakfast, lunch and dinner
- **Daily Plan** — Get 3 suggestions per meal type each day (favorites first). Pick and lock in your meals.
- **AI Meal Advisor** — Ask anything about your meals. Uses RAG (ChromaDB + Llama) to search your library and respond.
- **Weekly Plan** — Generate a full 7-day meal plan using Llama AI based on your meals.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v7 |
| Backend | Node.js, Express, Mongoose, MongoDB Atlas |
| AI Service | Python, FastAPI, ChromaDB, Groq (Llama 3.1) |
| Auth | JWT + bcryptjs |
| Vector Store | ChromaDB (local, sentence-transformer embeddings) |

## Project Structure

```
MealPlanner/
├── client/              # React + Vite frontend
│   └── src/
│       ├── api.js
│       ├── context/AuthContext.jsx
│       └── components/
│           ├── Auth/         # Login + Signup
│           ├── Landing/      # Public home page
│           ├── Home/         # My Meals (protected)
│           ├── DailyPlan/    # Daily suggestions (protected)
│           ├── AIMealAdvisor/ # AI chat (protected)
│           ├── WeeklyPlan/   # 7-day plan (protected)
│           └── Navbar/
│
├── server/              # Node.js + Express API
│   ├── models/
│   │   ├── User.js
│   │   ├── Meal.js
│   │   └── DailyPlan.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── meals.js
│   │   └── dailyPlan.js
│   ├── middleware/auth.js
│   └── index.js
│
└── engine/              # Python FastAPI AI service
    ├── rag/
    │   ├── vectorstore.py   # ChromaDB sync + semantic search
    │   └── advisor.py       # RAG pipeline + Groq streaming
    ├── weekly/
    │   └── planner.py       # Weekly plan generation
    ├── routes/
    │   ├── advisor.py
    │   └── weekly.py
    ├── main.py
    ├── config.py
    └── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Groq API key](https://console.groq.com) (free)

### 1. Clone

```bash
git clone https://github.com/AKSHIT-IITB/MealPlanner.git
cd MealPlanner
```

### 2. Backend (server/)

```bash
cd server
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/mealplanner
PORT=5000
JWT_SECRET=your_secret_key_here
```

```bash
npm run dev
```

### 3. AI Service (engine/)

```bash
cd engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=gsk_...
EXPRESS_API_URL=http://localhost:5000/api
CHROMA_PATH=./chroma_db
```

```bash
uvicorn main:app --reload --port 8000
```

> First run downloads the embedding model (~90MB, one time only).

### 4. Frontend (client/)

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## How the AI Advisor works

1. User clicks **Sync Meals** — fetches all meals from the database and stores them as vector embeddings in ChromaDB
2. User types a question like *"something high protein for lunch"*
3. The query is embedded and matched against stored meals using cosine similarity
4. Top 5 matching meals are passed as context to Llama 3.1
5. Llama responds with a recommendation based only on those meals
6. Response streams back to the browser in real time via SSE

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |

### Meals (requires auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/meals` | Get user's meals grouped by type |
| POST | `/api/meals` | Add a meal |
| DELETE | `/api/meals/:id` | Delete a meal |
| PATCH | `/api/meals/:id/favorite` | Toggle favorite |

### Daily Plan (requires auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/daily-plan` | Get today's plan |
| POST | `/api/daily-plan/regenerate` | Reshuffle suggestions |
| PUT | `/api/daily-plan/finalize` | Pick a meal for a slot |
| DELETE | `/api/daily-plan/finalize/:type` | Clear a slot |

### AI Engine
| Method | Route | Description |
|---|---|---|
| POST | `/ai-api/ask` | Stream AI recommendation (SSE) |
| POST | `/ai-api/sync` | Sync meals to ChromaDB |
| GET | `/ai-api/weekly-plan` | Get weekly plan |
| POST | `/ai-api/weekly-plan/generate` | Generate new weekly plan |

## Author

**Akshit Kumar**

- [LinkedIn](https://www.linkedin.com/in/akshit-kumar-7069392b9)
- [YouTube](https://www.youtube.com/@MedTechDiaries8)
- [X / Twitter](https://x.com/Akshit_iitb_27)
