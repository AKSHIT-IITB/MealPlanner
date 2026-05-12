const API = '/api'
const AI = '/ai-api'

function authHeader() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  return headers
}

// --- auth ---

export async function loginUser(email, password) {
  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function registerUser(name, email, password) {
  const res = await fetch(API + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  return data
}

// --- meals ---

export async function getMeals() {
  const res = await fetch(API + '/meals', { headers: authHeader() })
  return res.json()
}

export async function addMeal(type, name, desc) {
  const res = await fetch(API + '/meals', {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ type, name, desc })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function deleteMeal(id) {
  await fetch(API + '/meals/' + id, {
    method: 'DELETE',
    headers: authHeader()
  })
}

export async function toggleFavorite(id) {
  const res = await fetch(API + '/meals/' + id + '/favorite', {
    method: 'PATCH',
    headers: authHeader()
  })
  return res.json()
}

// --- daily plan ---

export async function getDailyPlan() {
  const res = await fetch(API + '/daily-plan', { headers: authHeader() })
  return res.json()
}

export async function regenerateSuggestions() {
  const res = await fetch(API + '/daily-plan/regenerate', {
    method: 'POST',
    headers: authHeader()
  })
  return res.json()
}

export async function finalizeMeal(type, meal) {
  const res = await fetch(API + '/daily-plan/finalize', {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ type, meal })
  })
  return res.json()
}

export async function removeFinalized(type) {
  const res = await fetch(API + '/daily-plan/finalize/' + type, {
    method: 'DELETE',
    headers: authHeader()
  })
  return res.json()
}

// --- ai engine ---

export async function syncVectorStore() {
  const res = await fetch(AI + '/sync', {
    method: 'POST',
    headers: authHeader()
  })
  return res.json()
}

export async function getWeeklyPlan() {
  const res = await fetch(AI + '/weekly-plan', { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to load plan')
  return res.json()
}

export async function generateWeeklyPlan() {
  const res = await fetch(AI + '/weekly-plan/generate', {
    method: 'POST',
    headers: authHeader()
  })
  if (!res.ok) throw new Error('Generation failed')
  return res.json()
}

export async function* streamAIAdvice(query, mealType, onSources) {
  const res = await fetch(AI + '/ask', {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ query, meal_type: mealType || null })
  })

  if (!res.ok) {
    yield 'Could not connect to AI service.'
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop()

    for (const part of parts) {
      if (!part.startsWith('data: ')) continue
      const text = part.slice(6).trim()

      if (text === '[DONE]') return

      if (text.startsWith('__SOURCES__:')) {
        const sources = JSON.parse(text.slice(12))
        if (onSources) onSources(sources)
      } else {
        yield text.replace(/__NL__/g, '\n')
      }
    }
  }
}
