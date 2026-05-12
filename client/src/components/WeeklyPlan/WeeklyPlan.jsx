import { useState, useEffect } from 'react'
import { FaCalendarAlt, FaRedo, FaExchangeAlt } from 'react-icons/fa'
import { GiMeal } from 'react-icons/gi'
import { getUserWeeklyPlan, saveWeeklyPlan, generateWeeklyPlan, swapMeal, getMeals } from '../../api.js'
import './WeeklyPlan.css'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

export default function WeeklyPlan() {
  const [plan, setPlan] = useState(null)
  const [meals, setMeals] = useState({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeCell, setActiveCell] = useState(null)

  useEffect(() => {
    Promise.all([getUserWeeklyPlan(), getMeals()])
      .then(([planData, mealsData]) => {
        setPlan(planData)
        setMeals(mealsData)
      })
      .catch(() => setError('Could not load data. Make sure the server is running.'))
      .finally(() => setLoading(false))
  }, [])

  // close dropdown when clicking outside the grid
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.wp-meal-cell')) {
        setActiveCell(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const fresh = await generateWeeklyPlan(meals)
      const saved = await saveWeeklyPlan(fresh)
      setPlan(saved)
    } catch (err) {
      setError(err.message || 'Generation failed. Make sure the AI service is running on port 8000.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSwap(dayIndex, type, mealName) {
    try {
      const updated = await swapMeal(dayIndex, type, mealName)
      setPlan(updated)
    } catch {
      setError('Could not save the swap.')
    }
    setActiveCell(null)
  }

  function toggleCell(dayIndex, type) {
    const isSame = activeCell?.dayIndex === dayIndex && activeCell?.type === type
    setActiveCell(isSame ? null : { dayIndex, type })
  }

  if (loading) return <div className="wp-loading">Loading your weekly plan...</div>

  return (
    <div className="wp-container">
      <div className="wp-header">
        <div>
          <h1><FaCalendarAlt /> Weekly Meal Plan</h1>
          <p className="wp-subtitle">Click any meal cell to swap it from your library</p>
          {plan?.weekStart && (
            <p className="wp-week">
              Week of {new Date(plan.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          )}
        </div>
        <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
          <FaRedo className={generating ? 'spinning' : ''} />
          {generating ? 'Generating...' : plan?.days ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {error && <p className="wp-error">{error}</p>}

      {plan?.days ? (
        <div className="wp-grid">
          <div className="wp-cell wp-corner"><GiMeal /></div>
          {plan.days.map(day => (
            <div key={day.date} className="wp-cell wp-day-header">
              <span className="day-label">{day.label}</span>
              <span className="day-date">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          ))}

          {MEAL_TYPES.map(type => (
            <>
              <div key={type} className="wp-cell wp-type-header">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              {plan.days.map((day, dayIndex) => {
                const isOpen = activeCell?.dayIndex === dayIndex && activeCell?.type === type
                const typeMeals = meals[type] || []
                return (
                  <div
                    key={`${day.date}-${type}`}
                    className={`wp-cell wp-meal-cell ${type} ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleCell(dayIndex, type)}
                  >
                    <span className="meal-name">{day[type] || '—'}</span>
                    <FaExchangeAlt className="swap-icon" />
                    {isOpen && (
                      <div className="swap-dropdown" onClick={e => e.stopPropagation()}>
                        <p className="swap-hint">Pick a replacement:</p>
                        {typeMeals.length === 0 ? (
                          <p className="swap-empty">No {type} meals in library.</p>
                        ) : (
                          typeMeals.map(m => (
                            <button
                              key={m._id}
                              className={`swap-option ${day[type] === m.name ? 'current' : ''}`}
                              onClick={() => handleSwap(dayIndex, type, m.name)}
                            >
                              {m.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      ) : (
        !error && (
          <div className="wp-empty">
            <GiMeal className="wp-empty-icon" />
            <p>No plan yet. Generate one using your meal library.</p>
            <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate This Week\'s Plan'}
            </button>
          </div>
        )
      )}
    </div>
  )
}
