import express from 'express';
import DailyPlan from '../models/DailyPlan.js';
import Meal from '../models/Meal.js';

const router = express.Router();

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildSuggestions() {
  const meals = await Meal.find().lean();
  const suggestions = {};
  for (const type of MEAL_TYPES) {
    const favs = meals.filter(m => m.type === type && m.isFavorite);
    const others = shuffle(meals.filter(m => m.type === type && !m.isFavorite));
    // Store _id as string so JSON comparisons on the frontend always work
    suggestions[type] = [...favs, ...others].slice(0, 3).map(m => ({
      _id: m._id.toString(),
      name: m.name,
      desc: m.desc,
    }));
  }
  return suggestions;
}

// GET /api/daily-plan — get today's plan, create if it doesn't exist
router.get('/', async (req, res) => {
  try {
    const date = todayKey();
    let plan = await DailyPlan.findOne({ date });
    if (!plan) {
      const suggestions = await buildSuggestions();
      plan = await DailyPlan.create({ date, suggestions });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-plan/regenerate — reshuffle suggestions for today
router.post('/regenerate', async (req, res) => {
  try {
    const date = todayKey();
    const suggestions = await buildSuggestions();
    const plan = await DailyPlan.findOneAndUpdate(
      { date },
      { suggestions },
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/daily-plan/finalize — select a meal for a slot
router.put('/finalize', async (req, res) => {
  try {
    const { type, meal } = req.body;
    const date = todayKey();
    const plan = await DailyPlan.findOneAndUpdate(
      { date },
      { [`finalized.${type}`]: meal },
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/daily-plan/finalize/:type — clear a finalized meal slot
router.delete('/finalize/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const date = todayKey();
    const plan = await DailyPlan.findOneAndUpdate(
      { date },
      { [`finalized.${type}`]: null },
      { new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
