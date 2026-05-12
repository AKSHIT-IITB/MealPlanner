import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Meal from '../models/Meal.js'

const router = express.Router()

// default meals every new user gets
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
]

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields' })
    }

    // check if email is already taken
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })

    // give the new user their starter meals
    const meals = DEFAULT_MEALS.map(m => ({ ...m, userId: user._id }))
    await Meal.insertMany(meals)

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Wrong email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Wrong email or password' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
