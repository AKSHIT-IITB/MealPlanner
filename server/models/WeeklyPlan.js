import mongoose from 'mongoose'

const weeklyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weekStart: String,
  days: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('WeeklyPlan', weeklyPlanSchema)
