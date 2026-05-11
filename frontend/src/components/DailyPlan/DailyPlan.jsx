import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaPlus, FaTimes, FaUtensils, FaSearch, FaCalendarAlt, FaEdit, FaRedo } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import * as api from '../../api.js';
import './DailyPlan.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const DailyPlan = () => {
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', desc: '' });

  useEffect(() => {
    Promise.all([api.getMeals(), api.getDailyPlan()])
      .then(([mealsData, planData]) => {
        setMeals(mealsData);
        setPlan(planData);
      })
      .catch(() => setError('Could not connect to server. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = async (id) => {
    const updated = await api.toggleFavorite(id);
    setMeals(prev => ({
      ...prev,
      [updated.type]: prev[updated.type].map(m => m._id === id ? updated : m),
    }));
  };

  const handleFinalize = async (type, item) => {
    const updated = await api.finalizeMeal(type, { _id: item._id, name: item.name, desc: item.desc });
    setPlan(updated);
  };

  const handleRemoveFinalized = async (type) => {
    const updated = await api.removeFinalized(type);
    setPlan(updated);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    const { name, desc } = newMeal;
    if (!name.trim() || !desc.trim()) return;
    const created = await api.addMeal(activeMealType, name.trim(), desc.trim());
    setMeals(prev => ({ ...prev, [activeMealType]: [...prev[activeMealType], created] }));
    setNewMeal({ name: '', desc: '' });
  };

  const handleDeleteMeal = async (type, id) => {
    await api.deleteMeal(id);
    setMeals(prev => ({ ...prev, [type]: prev[type].filter(m => m._id !== id) }));
  };

  const handleRegenerate = async () => {
    const updated = await api.regenerateSuggestions();
    setPlan(updated);
  };

  const filteredMeals = (type) =>
    meals[type].filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <div className="loading">Loading your meal plan...</div>;
  if (error) return <div className="loading error">{error}</div>;

  const suggestions = plan?.suggestions?.[activeMealType] ?? [];
  const finalized = plan?.finalized ?? { breakfast: null, lunch: null, dinner: null };

  return (
    <div className="daily-plan-container">
      <div className="plan-header">
        <h1><GiMeal /> Daily Meal Planner</h1>
        <div className="date-time">
          <p><FaCalendarAlt /> {formatDate()}</p>
        </div>
      </div>

      <div className="meal-plan-content">
        <div className="meal-type-tabs">
          {MEAL_TYPES.map(type => (
            <button
              key={type}
              className={`tab-btn ${activeMealType === type ? 'active' : ''}`}
              onClick={() => setActiveMealType(type)}
            >
              {capitalize(type)}
            </button>
          ))}
        </div>

        <div className="meal-sections">
          <div className="suggestions-section">
            <div className="section-header">
              <h2><FaUtensils /> Today's {capitalize(activeMealType)} Suggestions</h2>
              <button onClick={handleRegenerate} className="edit-mode-btn" title="Reshuffle suggestions">
                <FaRedo />
              </button>
            </div>
            <p className="info-note">Favorites are always shown first</p>

            <div className="suggestions-grid">
              {suggestions.length === 0 ? (
                <p className="no-items">No meals in database for {activeMealType}.</p>
              ) : suggestions.map(item => (
                <div key={item._id} className="meal-card">
                  <div className="meal-content">
                    <div className="meal-info">
                      <h3>{item.name}</h3>
                      <p className="meal-desc">{item.desc}</p>
                      <button
                        onClick={() => handleFinalize(activeMealType, item)}
                        className="finalize-btn"
                        disabled={finalized[activeMealType]?._id === item._id}
                      >
                        {finalized[activeMealType]?._id === item._id ? 'Selected' : 'Select for Today'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="finalized-meals-section">
            <div className="section-header">
              <h2>Today's Meal Plan</h2>
              <button onClick={() => setEditMode(v => !v)} className="edit-mode-btn">
                {editMode ? 'Done' : <><FaEdit /> Edit</>}
              </button>
            </div>

            <div className="finalized-meals-list">
              {MEAL_TYPES.map(type => (
                <div key={type} className="finalized-meal">
                  <h3>{capitalize(type)}</h3>
                  {finalized[type] ? (
                    <div className="finalized-meal-card">
                      <div className="meal-content">
                        {editMode && (
                          <button
                            onClick={() => handleRemoveFinalized(type)}
                            className="remove-btn"
                            aria-label={`Remove ${finalized[type].name}`}
                          >
                            <FaTimes />
                          </button>
                        )}
                        <div className="meal-info">
                          <h4>{finalized[type].name}</h4>
                          <p className="meal-desc">{finalized[type].desc}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="no-meal">No meal selected yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="database-section">
          <div className="section-header">
            <h2>Meal Database</h2>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <form onSubmit={handleAddMeal} className="add-db-item-form">
            <h3>Add New {capitalize(activeMealType)} Meal</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Meal name"
                value={newMeal.name}
                onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newMeal.desc}
                onChange={(e) => setNewMeal(prev => ({ ...prev, desc: e.target.value }))}
                required
              />
              <button type="submit" className="add-btn"><FaPlus /> Add</button>
            </div>
          </form>

          <div className="database-list-container">
            {MEAL_TYPES.map(type => {
              const items = filteredMeals(type);
              return (
                <div key={type} className="database-category">
                  <h3>{capitalize(type)}</h3>
                  <div className="database-items">
                    {items.length === 0 ? (
                      <p className="no-items">No meals found</p>
                    ) : items.map(item => (
                      <div key={item._id} className="database-item">
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p className="meal-desc">{item.desc}</p>
                        </div>
                        <div className="item-actions">
                          <button
                            className={`fav-action-btn ${item.isFavorite ? 'favorited' : ''}`}
                            onClick={() => handleToggleFavorite(item._id)}
                            aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {item.isFavorite ? <FaHeart /> : <FaRegHeart />}
                          </button>
                          <button
                            className="del-action-btn"
                            onClick={() => handleDeleteMeal(type, item._id)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlan;
