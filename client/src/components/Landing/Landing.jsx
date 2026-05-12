import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaCalendarAlt, FaRobot, FaListAlt } from 'react-icons/fa';
import './Landing.css';

const SAMPLE_MEALS = {
  breakfast: [
    { name: 'Oatmeal', desc: 'Healthy oats with fruits and nuts' },
    { name: 'Smoothie Bowl', desc: 'Mixed fruits with yogurt and granola' },
    { name: 'Avocado Toast', desc: 'Whole grain bread with smashed avocado' },
  ],
  lunch: [
    { name: 'Caesar Salad', desc: 'Fresh greens with chicken and dressing' },
    { name: 'Pasta', desc: 'Al dente pasta with tomato sauce' },
    { name: 'Sushi', desc: 'Fresh fish with rice and seaweed' },
  ],
  dinner: [
    { name: 'Grilled Salmon', desc: 'Fresh salmon with lemon butter sauce' },
    { name: 'Stir Fry', desc: 'Vegetables with chicken in soy sauce' },
    { name: 'Risotto', desc: 'Creamy Italian rice dish' },
  ],
};

const FEATURES = [
  {
    icon: <FaUtensils />,
    title: 'Your Meal Library',
    desc: 'Build and manage your personal collection of breakfast, lunch and dinner options.',
  },
  {
    icon: <FaListAlt />,
    title: 'Daily Planner',
    desc: 'Get personalized daily meal suggestions based on your favorites every single day.',
  },
  {
    icon: <FaRobot />,
    title: 'AI Meal Advisor',
    desc: 'Ask our RAG-powered AI anything about your meals and get smart recommendations.',
  },
  {
    icon: <FaCalendarAlt />,
    title: 'Weekly Meal Plan',
    desc: 'Generate a full 7-day meal plan automatically using Llama AI.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Plan smarter,<br /><span>eat better</span></h1>
          <p>Your personal meal planning companion — organize dishes, get AI-powered suggestions, and never wonder "what's for dinner?" again.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/login?tab=register')}>
              Get Started Free
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Everything you need</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Daily Plan Preview */}
      <section className="preview-section">
        <div className="preview-header">
          <h2>See what your daily plan looks like</h2>
          <p>Sign up to get personalized suggestions from your own meal library</p>
        </div>
        <div className="preview-grid">
          {Object.entries(SAMPLE_MEALS).map(([type, meals]) => (
            <div key={type} className="preview-col">
              <div className={`preview-type-label ${type}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              {meals.map(m => (
                <div key={m.name} className="preview-meal-card">
                  <strong>{m.name}</strong>
                  <span>{m.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="preview-cta">
          <button className="btn-primary" onClick={() => navigate('/login?tab=register')}>
            Start planning for free
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
