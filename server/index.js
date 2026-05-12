import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import authRouter from './routes/auth.js';
import mealsRouter from './routes/meals.js';
import dailyPlanRouter from './routes/dailyPlan.js';
import weeklyPlanRouter from './routes/weeklyPlan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/daily-plan', dailyPlanRouter);
app.use('/api/weekly-plan', weeklyPlanRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    console.error('Fix: Go to MongoDB Atlas → Network Access → Add your IP (or 0.0.0.0/0 for dev)');
    process.exit(1);
  });
