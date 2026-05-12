import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaRedo } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import { getWeeklyPlan, generateWeeklyPlan } from '../../api.js';
import './WeeklyPlan.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const WeeklyPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWeeklyPlan()
      .then(setPlan)
      .catch(() => setError('Could not reach the AI service. Is it running on port 8000?'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const fresh = await generateWeeklyPlan();
      setPlan(fresh);
    } catch {
      setError('Generation failed — check that the AI service is running.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="wp-loading">Loading your weekly plan...</div>;

  return (
    <div className="wp-container">
      <div className="wp-header">
        <div>
          <h1><FaCalendarAlt /> Weekly Meal Plan</h1>
          <p className="wp-subtitle">
            Auto-generated every Sunday · Powered by AI
          </p>
          {plan?.weekStart && (
            <p className="wp-week">
              Week of {new Date(plan.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          )}
        </div>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          <FaRedo className={generating ? 'spinning' : ''} />
          {generating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {error && <p className="wp-error">{error}</p>}

      {plan?.days ? (
        <div className="wp-grid">
          {/* Header row */}
          <div className="wp-cell wp-corner"><GiMeal /></div>
          {plan.days.map(day => (
            <div key={day.date} className="wp-cell wp-day-header">
              <span className="day-label">{day.label}</span>
              <span className="day-date">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                })}
              </span>
            </div>
          ))}

          {/* One row per meal type */}
          {MEAL_TYPES.map(type => (
            <>
              <div key={type} className="wp-cell wp-type-header">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              {plan.days.map(day => (
                <div key={`${day.date}-${type}`} className={`wp-cell wp-meal-cell ${type}`}>
                  {day[type] || '—'}
                </div>
              ))}
            </>
          ))}
        </div>
      ) : (
        !error && (
          <div className="wp-empty">
            <p>No plan yet.</p>
            <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
              <FaRedo /> Generate This Week's Plan
            </button>
          </div>
        )
      )}

      <p className="wp-note">
        Plans are automatically regenerated every Sunday at 08:00 via APScheduler.
        Click Regenerate anytime to get a fresh plan after adding new meals.
      </p>
    </div>
  );
};

export default WeeklyPlan;
