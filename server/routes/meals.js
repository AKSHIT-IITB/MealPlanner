import express from 'express';
import Meal from '../models/Meal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

// Public endpoint used by the AI engine to sync meals
router.get('/sync-source', async (req, res) => {
  try {
    const meals = await Meal.find().lean();
    const grouped = Object.fromEntries(MEAL_TYPES.map(t => [t, []]));
    meals.forEach(m => grouped[m.type].push(m));
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId }).lean();
    const grouped = Object.fromEntries(MEAL_TYPES.map(t => [t, []]));
    meals.forEach(m => grouped[m.type].push(m));
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, name, desc } = req.body;
    const meal = await Meal.create({ userId: req.userId, type, name, desc });
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Meal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/favorite', async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.userId });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    meal.isFavorite = !meal.isFavorite;
    await meal.save();
    res.json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
