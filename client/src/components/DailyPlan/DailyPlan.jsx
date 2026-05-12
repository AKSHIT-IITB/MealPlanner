import { useState, useEffect } from 'react'
import { FaRedo, FaCheck, FaTimes } from 'react-icons/fa'
import { getDailyPlan, regenerateSuggestions, finalizeMeal, removeFinalized } from '../../api.js'
import './DailyPlan.css'

const TYPES = ['breakfast', 'lunch', 'dinner']

export default function DailyPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('breakfast')
  const [error, setError] = useState('')

  useEffect(() => {
    getDailyPlan()
      .then(setPlan)
      .catch(() => setError('Could not load plan. Is the server running?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleRegenerate() {
    const updated = await regenerateSuggestions()
    setPlan(updated)
  }

  async function handleSelect(meal) {
    const updated = await finalizeMeal(activeTab, { _id: meal._id, name: meal.name, desc: meal.desc })
    setPlan(updated)
  }

  async function handleRemove(type) {
    const updated = await removeFinalized(type)
    setPlan(updated)
  }

  if (loading) return <div className="dp-loading">Loading today's plan...</div>
  if (error) return <div className="dp-loading dp-error">{error}</div>

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const suggestions = plan?.suggestions?.[activeTab] || []
  const finalized = plan?.finalized || {}

  return (
    <div className="dp-page">
      <div className="dp-header">
        <div>
          <h1>Daily Plan</h1>
          <p>{today}</p>
        </div>
        <button className="regen-btn" onClick={handleRegenerate} title="Shuffle suggestions">
          <FaRedo /> Reshuffle
        </button>
      </div>

      {/* today's chosen meals */}
      <div className="dp-summary">
        <h2>Today's meals</h2>
        <div className="dp-summary-row">
          {TYPES.map(type => (
            <div key={type} className={`dp-summary-card ${type}`}>
              <span className="dp-type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              {finalized[type] ? (
                <div className="dp-finalized">
                  <strong>{finalized[type].name}</strong>
                  <button className="remove-btn" onClick={() => handleRemove(type)}>
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <span className="dp-empty">Not selected</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* suggestions picker */}
      <div className="dp-suggestions">
        <div className="dp-tabs">
          {TYPES.map(t => (
            <button
              key={t}
              className={activeTab === t ? 'dp-tab active' : 'dp-tab'}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <p className="dp-hint">Favorites show up first. Pick one for today.</p>

        <div className="dp-cards">
          {suggestions.length === 0 && (
            <p className="dp-no-meals">No meals in your library for {activeTab}. Go to My Meals to add some!</p>
          )}
          {suggestions.map(meal => {
            const selected = finalized[activeTab]?._id === meal._id
            return (
              <div key={meal._id} className={`dp-card ${selected ? 'selected' : ''}`}>
                <div>
                  <strong>{meal.name}</strong>
                  <p>{meal.desc}</p>
                </div>
                <button
                  className={selected ? 'pick-btn picked' : 'pick-btn'}
                  onClick={() => handleSelect(meal)}
                >
                  {selected ? <><FaCheck /> Selected</> : 'Pick this'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
