'use client';
import { useState, useEffect } from 'react';
import QuoteCard, { Quote } from '@/components/QuoteCard';
import { saveQuote, getSavedQuotes } from '@/lib/firebaseService';

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('inspiring');
  const [view, setView] = useState<'daily' | 'history'>('daily');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');

  const fetchDailyQuotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuotes(data.quotes || []);
      setSelectedQuote(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch daily quotes if there are none and we are in daily view
    if (view === 'daily' && quotes.length === 0) {
      fetchDailyQuotes();
    }
    // Fetch history if switching to history view
    if (view === 'history') {
      loadHistory();
    }
  }, [view, mood]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await getSavedQuotes();
      setSavedQuotes(history);
    } catch (err) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = async (quote: Quote) => {
    if (selectedQuote) return; // Already selected one today
    setSelectedQuote(quote);
    try {
      await saveQuote(quote);
      alert('Beautiful choice! Your quote has been saved to your history.');
    } catch (err) {
      setError('Failed to save the quote. Please check your Firebase configuration.');
      setSelectedQuote(null);
    }
  };

  return (
    <div className="app-wrapper">
      <header style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <h1 className="heading-1" style={{ color: 'var(--color-primary)' }}>Daily Gurbani</h1>
        <p className="text-body">Find peace, inspiration, and guidance.</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className={view === 'daily' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setView('daily')}
          >
            Today's Choices
          </button>
          <button 
            className={view === 'history' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setView('history')}
          >
            Archive / History
          </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {view === 'daily' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="heading-2">Select your guiding thought for today</h2>
              
              <select 
                value={mood} 
                onChange={(e) => { setMood(e.target.value); setQuotes([]); }}
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
              >
                <option value="inspiring">Inspiring</option>
                <option value="positive">Positive</option>
                <option value="peaceful">Peaceful</option>
                <option value="strength">Strength & Courage</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="text-body">Meditating on Gurbani... Generating quotes...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {quotes.map((quote, idx) => (
                  <QuoteCard 
                    key={idx} 
                    quote={quote} 
                    onSelect={selectedQuote ? undefined : handleSelectQuote}
                    isSelected={selectedQuote === quote}
                  />
                ))}
              </div>
            )}
            
            {!loading && quotes.length > 0 && !selectedQuote && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn-secondary" onClick={fetchDailyQuotes}>
                  Refresh Options
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="animate-fade-in">
            <h2 className="heading-2" style={{ marginBottom: '2rem' }}>Your Spiritual Journey</h2>
            {loading ? (
              <p>Loading your saved quotes...</p>
            ) : savedQuotes.length === 0 ? (
              <p className="text-body" style={{ textAlign: 'center' }}>You haven't saved any quotes yet. Go to Today's Choices to select one!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {savedQuotes.map((quote, idx) => (
                  <QuoteCard 
                    key={idx} 
                    quote={quote} 
                    isSavedMode={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
