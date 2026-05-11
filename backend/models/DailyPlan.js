import mongoose from 'mongoose';

// Stores a snapshot of meal data (id as string for safe JSON comparison)
const mealRefSchema = new mongoose.Schema(
  { _id: String, name: String, desc: String },
  { _id: false }
);

const dailyPlanSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
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

export default mongoose.model('DailyPlan', dailyPlanSchema);
