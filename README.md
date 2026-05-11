# Meal Planner Buddy

A full-stack meal planning web app that lets you plan your daily meals, manage a personal recipe database, and get smart daily suggestions — with favorites always shown first.

Built with **React + Vite** on the frontend and **Express + MongoDB Atlas** on the backend.

---

## Features

- **Daily Suggestions** — Get 3 curated meal suggestions per slot (breakfast / lunch / dinner) every day. Reshuffle anytime.
- **Favorites First** — Mark meals as favorites and they'll always surface at the top of suggestions.
- **Lock In Your Plan** — Select and save your final meals for the day. Changes persist in MongoDB.
- **Meal Database** — Add or remove meals from your personal database per meal type.
- **Search** — Filter your entire meal database by name or description.
- **Persistent Storage** — All data lives in MongoDB Atlas; nothing is lost on page refresh.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v7, React Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |

---

## Project Structure

```
MealPlanner/
├── backend/                  # Express + Mongoose API server
│   ├── models/
│   │   ├── Meal.js           # Meal schema (type, name, desc, isFavorite)
│   │   └── DailyPlan.js      # Daily plan schema (date, suggestions, finalized)
│   ├── routes/
│   │   ├── meals.js          # CRUD + favorite toggle for meals
│   │   └── dailyPlan.js      # Daily plan get / finalize / regenerate
│   ├── db.js                 # MongoDB connection
│   ├── index.js              # Server entry point
│   ├── .env                  # Environment variables (not committed)
│   ├── .env.example          # Template for .env
│   └── package.json
│
├── frontend/                 # Vite + React client
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api.js            # All fetch calls to the backend
│   │   ├── main.jsx          # React entry point
│   │   ├── App.jsx           # Router setup
│   │   ├── App.css
│   │   ├── index.css
│   │   └── components/
│   │       ├── Navbar/
│   │       ├── Footer/
│   │       ├── Home/
│   │       └── DailyPlan/
│   ├── index.html
│   ├── vite.config.js        # Dev proxy: /api → localhost:5000
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/MealPlanner.git
cd MealPlanner
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mealplanner?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

Start the backend server:

```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

The backend runs on **http://localhost:5000**.

On first run, the database is automatically seeded with 15 default meals (5 per slot).

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173** and automatically proxies `/api/*` requests to the backend.

---

## API Reference

### Meals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meals` | Get all meals grouped by type |
| `POST` | `/api/meals` | Add a new meal |
| `DELETE` | `/api/meals/:id` | Delete a meal by ID |
| `PATCH` | `/api/meals/:id/favorite` | Toggle favorite status |

**POST `/api/meals` body:**
```json
{
  "type": "breakfast",
  "name": "Oatmeal",
  "desc": "Healthy oats with fruits and nuts"
}
```

### Daily Plan

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/daily-plan` | Get today's plan (auto-created if new day) |
| `POST` | `/api/daily-plan/regenerate` | Reshuffle today's suggestions |
| `PUT` | `/api/daily-plan/finalize` | Select a meal for a slot |
| `DELETE` | `/api/daily-plan/finalize/:type` | Clear a finalized meal slot |

**PUT `/api/daily-plan/finalize` body:**
```json
{
  "type": "lunch",
  "meal": { "_id": "...", "name": "Burger", "desc": "..." }
}
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `PORT` | Port the backend listens on | `5000` |

---

## Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm start` | Start in production mode |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## Deployment

### Backend
Deploy to any Node.js host (Railway, Render, Fly.io). Set the `MONGODB_URI` and `PORT` environment variables on the platform.

### Frontend
Build with `npm run build` inside `frontend/`, then deploy the `dist/` folder to Vercel, Netlify, or any static host. Set the API base URL to your deployed backend URL.

---

## Author

**Akshit Kumar**

- [LinkedIn](https://www.linkedin.com/in/akshit-kumar-7069392b9)
- [YouTube](https://www.youtube.com/@MedTechDiaries8)
- [X / Twitter](https://x.com/Akshit_iitb_27)

---

## License

MIT
