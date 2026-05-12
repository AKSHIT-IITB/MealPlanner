import express from 'express'
import { protect } from '../middleware/auth.js'
import WeeklyPlan from '../models/WeeklyPlan.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  const plan = await WeeklyPlan.findOne({ userId: req.userId })
  res.json(plan || null)
})

router.post('/', protect, async (req, res) => {
  const { weekStart, days } = req.body
  const plan = await WeeklyPlan.findOneAndUpdate(
    { userId: req.userId },
    { weekStart, days, updatedAt: new Date() },
    { upsert: true, new: true }
  )
  res.json(plan)
})

router.patch('/swap', protect, async (req, res) => {
  const { dayIndex, type, meal } = req.body
  const setKey = `days.${dayIndex}.${type}`
  const plan = await WeeklyPlan.findOneAndUpdate(
    { userId: req.userId },
    { $set: { [setKey]: meal, updatedAt: new Date() } },
    { new: true }
  )
  if (!plan) return res.status(404).json({ error: 'No plan found' })
  res.json(plan)
})

export default router
