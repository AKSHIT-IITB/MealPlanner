import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaHeart, FaRandom } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import './Home.css';

const FEATURES = [
  {
    icon: <FaCalendarAlt />,
    title: 'Plan Your Day',
    desc: 'Pick breakfast, lunch, and dinner from your personal meal database and lock in your daily plan.',
  },
  {
    icon: <FaRandom />,
    title: 'Smart Suggestions',
    desc: 'Get three fresh meal suggestions each day. Favorites always surface first — reshuffle anytime.',
  },
  {
    icon: <FaHeart />,
    title: 'Save Favorites',
    desc: 'Mark meals you love so they always appear at the top of your suggestions.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <section className="cta-section">
        <GiMeal className="cta-icon" />
        <h1>Plan Smarter. Eat Better.</h1>
        <p>Your personal meal planner — simple, fast, and backed by MongoDB.</p>
        <button onClick={() => navigate('/daily-plan')}>Start Planning Today</button>
      </section>

      <section className="features-section">
        <h2>How It Works</h2>
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
    </div>
  );
};

export default Home;
