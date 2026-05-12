import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  name: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  isFavorite: { type: Boolean, default: false },
});

export default mongoose.model('Meal', mealSchema);
