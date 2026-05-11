import express from 'express';
import Meal from '../models/Meal.js';

const router = express.Router();

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const DEFAULT_MEALS = [
  { type: 'breakfast', name: 'Oatmeal', desc: 'Healthy oats with fruits and nuts' },
  { type: 'breakfast', name: 'Pancakes', desc: 'Fluffy pancakes with maple syrup' },
  { type: 'breakfast', name: 'Smoothie Bowl', desc: 'Mixed fruits with yogurt and granola' },
  { type: 'breakfast', name: 'Avocado Toast', desc: 'Whole grain bread with smashed avocado' },
  { type: 'breakfast', name: 'Eggs Benedict', desc: 'Poached eggs with hollandaise sauce' },
  { type: 'lunch', name: 'Caesar Salad', desc: 'Fresh greens with chicken and dressing' },
  { type: 'lunch', name: 'Burger', desc: 'Juicy beef patty with cheese and veggies' },
  { type: 'lunch', name: 'Sushi', desc: 'Fresh fish with rice and seaweed' },
  { type: 'lunch', name: 'Pasta', desc: 'Al dente pasta with tomato sauce' },
  { type: 'lunch', name: 'Tacos', desc: 'Mexican style with various fillings' },
  { type: 'dinner', name: 'Grilled Salmon', desc: 'Fresh salmon with lemon butter sauce' },
  { type: 'dinner', name: 'Steak', desc: 'Juicy ribeye with mashed potatoes' },
  { type: 'dinner', name: 'Stir Fry', desc: 'Vegetables with chicken in soy sauce' },
  { type: 'dinner', name: 'Pizza', desc: 'Thin crust with mozzarella and toppings' },
  { type: 'dinner', name: 'Risotto', desc: 'Creamy Italian rice dish' },
];

async function seedIfEmpty() {
  const count = await Meal.countDocuments();
  if (count === 0) await Meal.insertMany(DEFAULT_MEALS);
}

seedIfEmpty();

// GET /api/meals — all meals grouped by type
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find().lean();
    const grouped = Object.fromEntries(MEAL_TYPES.map(t => [t, []]));
    meals.forEach(m => grouped[m.type].push(m));
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals — add a meal
router.post('/', async (req, res) => {
  try {
    const { type, name, desc } = req.body;
    const meal = await Meal.create({ type, name, desc });
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/meals/:id — remove a meal
router.delete('/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/meals/:id/favorite — toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    meal.isFavorite = !meal.isFavorite;
    await meal.save();
    res.json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
