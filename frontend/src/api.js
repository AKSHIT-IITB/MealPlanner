const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getMeals = () => request('/meals');

export const addMeal = (type, name, desc) =>
  request('/meals', { method: 'POST', body: JSON.stringify({ type, name, desc }) });

export const deleteMeal = (id) =>
  request(`/meals/${id}`, { method: 'DELETE' });

export const toggleFavorite = (id) =>
  request(`/meals/${id}/favorite`, { method: 'PATCH' });

export const getDailyPlan = () => request('/daily-plan');

export const regenerateSuggestions = () =>
  request('/daily-plan/regenerate', { method: 'POST' });

export const finalizeMeal = (type, meal) =>
  request('/daily-plan/finalize', { method: 'PUT', body: JSON.stringify({ type, meal }) });

export const removeFinalized = (type) =>
  request(`/daily-plan/finalize/${type}`, { method: 'DELETE' });
