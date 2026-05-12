import mongoose from 'mongoose';

const mealRefSchema = new mongoose.Schema(
  { _id: String, name: String, desc: String },
  { _id: false }
);

const dailyPlanSchema = new mongoose.Schema({
  date: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  suggestions: {
    breakfast: [mealRefSchema],
    lunch: [mealRefSchema],
    dinner: [mealRefSchema],
  },
  finalized: {
    breakfast: { type: mealRefSchema, default: null },
    lunch: { type: mealRefSchema, default: null },
    dinner: { type: mealRefSchema, default: null },
  },
});

dailyPlanSchema.index({ date: 1, userId: 1 }, { unique: true });

export default mongoose.model('DailyPlan', dailyPlanSchema);
