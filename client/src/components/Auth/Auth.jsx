import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { loginUser, registerUser } from '../../api.js'
import './Auth.css'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, isAuth } = useAuth()
  const navigate = useNavigate()

  // sync tab with URL param so navbar Login/Sign Up buttons work
  useEffect(() => {
    setTab(searchParams.get('tab') === 'register' ? 'register' : 'login')
    setError('')
  }, [searchParams])

  // if already logged in, go to meals
  useEffect(() => {
    if (isAuth) navigate('/meals')
  }, [isAuth])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let data
      if (tab === 'login') {
        data = await loginUser(email, password)
      } else {
        if (!name.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        data = await registerUser(name, email, password)
      }
      login(data.user, data.token)
      navigate('/meals')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchTab(newTab) {
    setTab(newTab)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          Meal Planner <span>Buddy</span>
        </div>
        <p className="auth-tagline">Plan smarter, eat better</p>

        <div className="auth-tabs">
          <button
            className={tab === 'login' ? 'active' : ''}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            className={tab === 'register' ? 'active' : ''}
            onClick={() => switchTab('register')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}>
            {tab === 'login' ? 'Sign up free' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}
