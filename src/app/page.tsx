'use client';
import { useState, useEffect } from 'react';
import QuoteCard, { Quote } from '@/components/QuoteCard';
import { saveQuote, getSavedQuotes, getDailyQuotes, saveDailyQuotes } from '@/lib/firebaseService';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user, loading: authLoading, signIn, logOut } = useAuth();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('inspiring');
  const [view, setView] = useState<'daily' | 'history'>('daily');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const fetchDailyQuotes = async (forceRefresh = false) => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    try {
      const todayStr = getTodayDateString();
      
      if (!forceRefresh) {
        const cachedQuotes = await getDailyQuotes(user.uid, todayStr);
        if (cachedQuotes && cachedQuotes.length > 0) {
          setQuotes(cachedQuotes);
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/generate-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const newQuotes = data.quotes || [];
      setQuotes(newQuotes);
      setSelectedQuote(null);
      
      // Cache in cloud
      await saveDailyQuotes(user.uid, todayStr, newQuotes);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    if (view === 'daily' && quotes.length === 0) {
      fetchDailyQuotes(false);
    }
    if (view === 'history') {
      loadHistory();
    }
  }, [view, mood, user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const history = await getSavedQuotes(user.uid);
      setSavedQuotes(history);
    } catch (err) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = async (quote: Quote) => {
    if (selectedQuote || !user) return; 
    setSelectedQuote(quote);
    try {
      await saveQuote(quote, user.uid);
      alert('Beautiful choice! Your quote has been saved to your history.');
    } catch (err) {
      setError('Failed to save the quote. Please check your Firebase configuration.');
      setSelectedQuote(null);
    }
  };

  if (authLoading) {
    return (
      <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p className="text-body">Loading Roohani...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 className="heading-1" style={{ color: 'var(--color-primary)' }}>Roohani</h1>
          <p className="text-body" style={{ marginBottom: '2rem' }}>Sign in to receive your daily Gurbani quotes and access them seamlessly across all your devices.</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', paddingBottom: '1rem' }}>
          <h1 className="heading-2" style={{ color: 'var(--color-primary)', margin: 0 }}>Roohani</h1>
          <button className="btn-secondary" onClick={logOut} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Sign Out
          </button>
        </div>
        
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
                <button className="btn-secondary" onClick={() => fetchDailyQuotes(true)}>
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
