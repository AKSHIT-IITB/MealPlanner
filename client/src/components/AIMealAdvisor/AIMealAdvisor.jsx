import { useState } from 'react';
import { FaPaperPlane, FaRobot, FaSync } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import { streamAIAdvice, syncVectorStore } from '../../api.js';
import './AIMealAdvisor.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const AIMealAdvisor = () => {
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setSources([]);

    try {
      for await (const chunk of streamAIAdvice(query, mealType || null, setSources)) {
        setResponse(prev => prev + chunk);
      }
    } catch {
      setResponse('Could not reach the AI service. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const data = await syncVectorStore();
      setSyncMsg(`Synced ${data.synced} meals to vector store.`);
    } catch {
      setSyncMsg('Sync failed — is the AI service running?');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 4000);
    }
  };

  return (
    <div className="advisor-container">
      <div className="advisor-header">
        <h1><FaRobot /> AI Meal Advisor</h1>
        <p className="advisor-subtitle">
          Ask anything about your meals — powered by RAG + AI
        </p>
        <button
          className="sync-btn"
          onClick={handleSync}
          disabled={syncing}
          title="Re-sync meal database with the AI vector store"
        >
          <FaSync className={syncing ? 'spinning' : ''} />
          {syncing ? 'Syncing...' : 'Sync Meals'}
        </button>
        {syncMsg && <p className="sync-msg">{syncMsg}</p>}
      </div>

      <div className="advisor-examples">
        <p>Try asking:</p>
        <div className="example-chips">
          {[
            'High protein breakfast ideas',
            'Something light for lunch',
            'Quick dinner options',
            'My favorite meals',
          ].map(ex => (
            <button
              key={ex}
              className="chip"
              onClick={() => setQuery(ex)}
              disabled={loading}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAsk} className="advisor-form">
        <div className="form-row">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="type-select"
            disabled={loading}
          >
            <option value="">All meal types</option>
            {MEAL_TYPES.map(t => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)} only
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ask about your meals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="advisor-input"
          />

          <button type="submit" className="ask-btn" disabled={loading || !query.trim()}>
            <FaPaperPlane />
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {(response || loading) && (
        <div className="advisor-response">
          <div className="response-header">
            <FaRobot className="bot-icon" />
            <span>AI recommendation</span>
          </div>
          <p className="response-text">
            {response}
            {loading && <span className="cursor">▍</span>}
          </p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="sources-section">
          <p className="sources-label"><GiMeal /> Meals retrieved from your database</p>
          <div className="sources-grid">
            {sources.map((s, i) => (
              <div key={i} className="source-card">
                <span className="source-type">{s.type}</span>
                <h4>{s.name}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMealAdvisor;
