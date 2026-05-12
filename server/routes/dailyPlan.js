import express from 'express';
import DailyPlan from '../models/DailyPlan.js';
import Meal from '../models/Meal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

router.use(protect);

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

async function buildSuggestions(userId) {
  const meals = await Meal.find({ userId }).lean();
  const suggestions = {};
  for (const type of MEAL_TYPES) {
    const favs = meals.filter(m => m.type === type && m.isFavorite);
    const others = shuffle(meals.filter(m => m.type === type && !m.isFavorite));
    suggestions[type] = [...favs, ...others].slice(0, 3).map(m => ({
      _id: m._id.toString(),
      name: m.name,
      desc: m.desc,
    }));
  }
  return suggestions;
}

router.get('/', async (req, res) => {
  try {
    const date = todayKey();
    let plan = await DailyPlan.findOne({ date, userId: req.userId });
    if (!plan) {
      const suggestions = await buildSuggestions(req.userId);
      plan = await DailyPlan.create({ date, userId: req.userId, suggestions });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/regenerate', async (req, res) => {
  try {
    const date = todayKey();
    const suggestions = await buildSuggestions(req.userId);
    const plan = await DailyPlan.findOneAndUpdate(
      { date, userId: req.userId },
      { suggestions },
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/finalize', async (req, res) => {
  try {
    const { type, meal } = req.body;
    const date = todayKey();
    const plan = await DailyPlan.findOneAndUpdate(
      { date, userId: req.userId },
      { [`finalized.${type}`]: meal },
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/finalize/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const date = todayKey();
    const plan = await DailyPlan.findOneAndUpdate(
      { date, userId: req.userId },
      { [`finalized.${type}`]: null },
      { new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
