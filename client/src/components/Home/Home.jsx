import { useState, useEffect } from 'react'
import { FaHeart, FaRegHeart, FaPlus, FaTrash } from 'react-icons/fa'
import { getMeals, addMeal, deleteMeal, toggleFavorite } from '../../api.js'
import './Home.css'

const TYPES = ['breakfast', 'lunch', 'dinner']

export default function Home() {
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], dinner: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('breakfast')
  const [form, setForm] = useState({ name: '', desc: '' })
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch(() => setError('Could not load meals'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.desc.trim()) return
    try {
      const created = await addMeal(activeTab, form.name.trim(), form.desc.trim())
      setMeals(prev => ({ ...prev, [activeTab]: [...prev[activeTab], created] }))
      setForm({ name: '', desc: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(type, id) {
    await deleteMeal(id)
    setMeals(prev => ({ ...prev, [type]: prev[type].filter(m => m._id !== id) }))
  }

  async function handleFavorite(id, type) {
    const updated = await toggleFavorite(id)
    setMeals(prev => ({
      ...prev,
      [type]: prev[type].map(m => m._id === id ? updated : m)
    }))
  }

  const filtered = meals[activeTab].filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page-loading">Loading your meals...</div>

  return (
    <div className="meals-page">
      <div className="meals-header">
        <h1>My Meals</h1>
        <p>Your personal meal library — add, remove, and mark favorites</p>
      </div>

      {error && <p className="meals-error">{error}</p>}

      <div className="meals-tabs">
        {TYPES.map(t => (
          <button
            key={t}
            className={activeTab === t ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">{meals[t].length}</span>
          </button>
        ))}
      </div>

      <div className="meals-body">
        <form onSubmit={handleAdd} className="add-meal-form">
          <h3>Add new {activeTab}</h3>
          <div className="form-row">
            <input
              placeholder="Meal name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              placeholder="Short description"
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              required
            />
            <button type="submit" className="add-btn">
              <FaPlus /> Add
            </button>
          </div>
        </form>

        <div className="search-row">
          <input
            placeholder="Search meals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="meal-list">
          {filtered.length === 0 && (
            <p className="empty-msg">No meals here yet. Add one above!</p>
          )}
          {filtered.map(meal => (
            <div key={meal._id} className="meal-item">
              <div className="meal-info">
                <strong>{meal.name}</strong>
                <span>{meal.desc}</span>
              </div>
              <div className="meal-actions">
                <button
                  className={meal.isFavorite ? 'fav-btn on' : 'fav-btn'}
                  onClick={() => handleFavorite(meal._id, activeTab)}
                  title={meal.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
                >
                  {meal.isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button
                  className="del-btn"
                  onClick={() => handleDelete(activeTab, meal._id)}
                  title="Delete meal"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
