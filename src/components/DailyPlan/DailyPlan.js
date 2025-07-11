import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaHeart, FaRegHeart, FaPlus, FaTimes, FaUtensils, FaSearch, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import './DailyPlan.css';

const DailyPlan = () => {
  // Memoize mealTypes to prevent recreation on every render
  const mealTypes = useMemo(() => ['breakfast', 'lunch', 'dinner'], []);
  
  // Enhanced default meal database with more options
  const defaultMealDatabase = {
    breakfast: [
      { id: 1, name: "Oatmeal", desc: "Healthy oats with fruits and nuts" },
      { id: 2, name: "Pancakes", desc: "Fluffy pancakes with maple syrup" },
      { id: 3, name: "Smoothie Bowl", desc: "Mixed fruits with yogurt and granola" },
      { id: 4, name: "Avocado Toast", desc: "Whole grain bread with smashed avocado" },
      { id: 5, name: "Eggs Benedict", desc: "Poached eggs with hollandaise sauce" }
    ],
    lunch: [
      { id: 1, name: "Caesar Salad", desc: "Fresh greens with chicken and dressing" },
      { id: 2, name: "Burger", desc: "Juicy beef patty with cheese and veggies" },
      { id: 3, name: "Sushi", desc: "Fresh fish with rice and seaweed" },
      { id: 4, name: "Pasta", desc: "Al dente pasta with tomato sauce" },
      { id: 5, name: "Tacos", desc: "Mexican style with various fillings" }
    ],
    dinner: [
      { id: 1, name: "Grilled Salmon", desc: "Fresh salmon with lemon butter sauce" },
      { id: 2, name: "Steak", desc: "Juicy ribeye with mashed potatoes" },
      { id: 3, name: "Stir Fry", desc: "Vegetables with chicken in soy sauce" },
      { id: 4, name: "Pizza", desc: "Thin crust with mozzarella and toppings" },
      { id: 5, name: "Risotto", desc: "Creamy Italian rice dish" }
    ]
  };

  // State initialization with localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteMeals');
    return saved ? JSON.parse(saved) : { breakfast: [], lunch: [], dinner: [] };
  });

  const [finalizedMeals, setFinalizedMeals] = useState(() => {
    const saved = localStorage.getItem('finalizedMeals');
    return saved ? JSON.parse(saved) : { breakfast: null, lunch: null, dinner: null };
  });

  const [mealDatabase, setMealDatabase] = useState(() => {
    const saved = localStorage.getItem('mealDatabase');
    return saved ? JSON.parse(saved) : defaultMealDatabase;
  });

  const [suggestions, setSuggestions] = useState({
    breakfast: [],
    lunch: [],
    dinner: []
  });

  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newDbItem, setNewDbItem] = useState({ name: '', desc: '' });
  const [todaysDateKey, setTodaysDateKey] = useState('');

  // Generate a consistent date key for the current day
  useEffect(() => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    setTodaysDateKey(dateKey);
  }, []);

  // Fisher-Yates shuffle algorithm for unbiased shuffling
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Memoize generateDailySuggestions with all dependencies
  const generateDailySuggestions = useCallback(() => {
    const newSuggestions = {};
    
    mealTypes.forEach(mealType => {
      const favoriteItems = mealDatabase[mealType].filter(item => 
        favorites[mealType].includes(item.name)
      );

      const nonFavoriteItems = mealDatabase[mealType].filter(item => 
        !favorites[mealType].includes(item.name)
      );

      const shuffledNonFavorites = shuffleArray(nonFavoriteItems);
      const combined = [...favoriteItems, ...shuffledNonFavorites];
      
      const selected = [];
      const selectedNames = new Set();
      
      for (const item of combined) {
        if (!selectedNames.has(item.name)) {
          selected.push(item);
          selectedNames.add(item.name);
          if (selected.length === 3) break;
        }
      }

      newSuggestions[mealType] = selected;
    });

    setSuggestions(newSuggestions);
  }, [mealDatabase, favorites, mealTypes]); // Added mealTypes to dependencies

  // Update current time every second and check for day change
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      
      const newDateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (newDateKey !== todaysDateKey) {
        setTodaysDateKey(newDateKey);
        generateDailySuggestions();
        setFinalizedMeals({ breakfast: null, lunch: null, dinner: null });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [todaysDateKey, generateDailySuggestions]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedSuggestions = JSON.parse(localStorage.getItem('dailySuggestions')) || {
          breakfast: [],
          lunch: [],
          dinner: []
        };
        const suggestionsDate = localStorage.getItem('suggestionsDateKey');

        if (suggestionsDate === todaysDateKey) {
          setSuggestions(savedSuggestions);
        } else {
          generateDailySuggestions();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        generateDailySuggestions();
      }
    };

    loadData();
  }, [todaysDateKey, generateDailySuggestions]);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('favoriteMeals', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('finalizedMeals', JSON.stringify(finalizedMeals));
  }, [finalizedMeals]);

  useEffect(() => {
    localStorage.setItem('mealDatabase', JSON.stringify(mealDatabase));
  }, [mealDatabase]);

  useEffect(() => {
    localStorage.setItem('dailySuggestions', JSON.stringify(suggestions));
    localStorage.setItem('suggestionsDateKey', todaysDateKey);
  }, [suggestions, todaysDateKey]);

  // Toggle favorite status
  const toggleFavorite = (mealType, itemName) => {
    setFavorites(prev => {
      const isFavorite = prev[mealType].includes(itemName);
      const updatedFavorites = {
        ...prev,
        [mealType]: isFavorite
          ? prev[mealType].filter(name => name !== itemName)
          : [...prev[mealType], itemName]
      };
      
      generateDailySuggestions();
      return updatedFavorites;
    });
  };

  // Finalize a meal for the day
  const finalizeMeal = (mealType, item) => {
    setFinalizedMeals(prev => ({
      ...prev,
      [mealType]: item
    }));
  };

  // Remove a finalized meal
  const removeFinalizedMeal = (mealType) => {
    setFinalizedMeals(prev => ({
      ...prev,
      [mealType]: null
    }));
  };

  // Format date and time
  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Filter items based on search term
  const filteredItems = (mealType) => {
    return mealDatabase[mealType].filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Add new item to meal database
  const addToMealDatabase = (e) => {
    e.preventDefault();
    if (newDbItem.name.trim() && newDbItem.desc.trim()) {
      const newItem = {
        id: Date.now(),
        name: newDbItem.name.trim(),
        desc: newDbItem.desc.trim()
      };
      
      setMealDatabase(prev => ({
        ...prev,
        [activeMealType]: [...prev[activeMealType], newItem]
      }));
      
      setNewDbItem({ name: '', desc: '' });
      generateDailySuggestions();
    }
  };

  // Remove item from meal database
  const removeFromMealDatabase = (mealType, id) => {
    setMealDatabase(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(item => item.id !== id)
    }));
    
    setFavorites(prev => {
      const itemName = mealDatabase[mealType].find(item => item.id === id)?.name;
      if (itemName) {
        return {
          ...prev,
          [mealType]: prev[mealType].filter(name => name !== itemName)
        };
      }
      return prev;
    });
    
    generateDailySuggestions();
  };

  return (
    <div className="daily-plan-container">
      <div className="plan-header">
        <h1><GiMeal /> Daily Meal Planner</h1>
        <div className="date-time">
          <p><FaCalendarAlt /> {formatDateTime(currentDateTime)}</p>
        </div>
      </div>

      <div className="meal-plan-content">
        <div className="meal-type-tabs">
          {mealTypes.map(mealType => (
            <button
              key={mealType}
              className={`tab-btn ${activeMealType === mealType ? 'active' : ''}`}
              onClick={() => setActiveMealType(mealType)}
            >
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </button>
          ))}
        </div>

        <div className="meal-sections">
          <div className="suggestions-section">
            <h2><FaUtensils /> Today's {activeMealType} Suggestions</h2>
            <p className="info-note">These suggestions will refresh tomorrow</p>
            
            <div className="suggestions-grid">
              {suggestions[activeMealType].map((item, index) => (
                <div key={`${item.id}-${index}`} className="meal-card">
                  <div className="meal-content">
                    <button 
                      className={`favorite-btn ${favorites[activeMealType].includes(item.name) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(activeMealType, item.name)}
                      aria-label={favorites[activeMealType].includes(item.name) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites[activeMealType].includes(item.name) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <div className="meal-info">
                      <h3>{item.name}</h3>
                      <p className="meal-desc">{item.desc}</p>
                      <button 
                        onClick={() => finalizeMeal(activeMealType, item)}
                        className="finalize-btn"
                        disabled={finalizedMeals[activeMealType]?.id === item.id}
                      >
                        {finalizedMeals[activeMealType]?.id === item.id ? 'Selected' : 'Select for Today'}
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
              <button 
                onClick={() => setEditMode(!editMode)}
                className="edit-mode-btn"
              >
                {editMode ? 'Done Editing' : <><FaEdit /> Edit</>}
              </button>
            </div>

            <div className="finalized-meals-list">
              {mealTypes.map(mealType => (
                <div key={mealType} className="finalized-meal">
                  <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                  {finalizedMeals[mealType] ? (
                    <div className="finalized-meal-card">
                      <div className="meal-content">
                        {editMode && (
                          <button 
                            onClick={() => removeFinalizedMeal(mealType)}
                            className="remove-btn"
                            aria-label={`Remove ${finalizedMeals[mealType].name}`}
                          >
                            <FaTimes />
                          </button>
                        )}
                        <div className="meal-info">
                          <h4>{finalizedMeals[mealType].name}</h4>
                          <p className="meal-desc">{finalizedMeals[mealType].desc}</p>
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

          <form onSubmit={addToMealDatabase} className="add-db-item-form">
            <h3>Add New Meal to {activeMealType.charAt(0).toUpperCase() + activeMealType.slice(1)}</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Meal name"
                value={newDbItem.name}
                onChange={(e) => setNewDbItem({...newDbItem, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newDbItem.desc}
                onChange={(e) => setNewDbItem({...newDbItem, desc: e.target.value})}
                required
              />
              <button type="submit" className="add-btn">
                <FaPlus /> Add
              </button>
            </div>
          </form>

          <div className="database-list-container">
            {mealTypes.map(mealType => (
              <div key={mealType} className="database-category">
                <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                <div className="database-items">
                  {filteredItems(mealType).length > 0 ? (
                    filteredItems(mealType).map((item) => (
                      <div key={item.id} className="database-item">
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p className="meal-desc">{item.desc}</p>
                        </div>
                        <div className="item-actions">
                          <button 
                            className={`favorite-btn ${favorites[mealType].includes(item.name) ? 'favorited' : ''}`}
                            onClick={() => toggleFavorite(mealType, item.name)}
                            aria-label={favorites[mealType].includes(item.name) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {favorites[mealType].includes(item.name) ? <FaHeart /> : <FaRegHeart />}
                          </button>
                          <button 
                            onClick={() => removeFromMealDatabase(mealType, item.id)}
                            className="remove-btn"
                            aria-label={`Remove ${item.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">No meals found</p>
                  )}
                </div>
              </div>
            ))}
          </div> 
        </div>
      </div>
    </div>
  );
};

export default DailyPlan;