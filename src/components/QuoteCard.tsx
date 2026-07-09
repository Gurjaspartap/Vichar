'use client';
import React, { useState } from 'react';

export interface Quote {
  id?: string;
  gurmukhi: string;
  transliteration: string;
  translation: string;
  timestamp?: number;
}

interface QuoteCardProps {
  quote: Quote;
  onSelect?: (quote: Quote) => void;
  isSelected?: boolean;
  isSavedMode?: boolean;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function QuoteCard({ quote, onSelect, isSelected, isSavedMode }: QuoteCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(quote.gurmukhi);
      utterance.lang = 'pa-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    const newHistory = [...chatHistory, { role: 'user', content: userMessage } as ChatMessage];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote,
          message: userMessage,
          history: chatHistory
        })
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setChatHistory([...newHistory, { role: 'model', content: data.response }]);
    } catch (err) {
      alert("Failed to get response from AI.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div 
      className={`glass-card ${isSelected ? 'selected' : ''}`}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        border: isSelected ? '2px solid var(--color-primary)' : '',
        marginBottom: '1rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={(e) => {
        // Only trigger select if chat is closed or click is on the main card body
        if (onSelect) onSelect(quote);
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'var(--color-primary)',
          color: 'white',
          padding: '0.25rem 1rem',
          borderBottomLeftRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          Selected for Today
        </div>
      )}
      
      {isSavedMode && quote.timestamp && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'var(--color-secondary)',
          color: 'white',
          padding: '0.25rem 1rem',
          borderBottomLeftRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {new Date(quote.timestamp).toLocaleDateString()}
        </div>
      )}

      <button 
        onClick={handleReadAloud}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 2
        }}
        title="Listen in Punjabi"
      >
        🔊
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: (isSelected || isSavedMode) ? '1rem' : '0' }}>
        <h3 className="heading-2" style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontFamily: 'serif' }}>
          {quote.gurmukhi}
        </h3>
        <p className="text-body" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
          {quote.transliteration}
        </p>
      </div>
      
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
        <p className="text-body" style={{ fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '1rem' }}>
          {quote.translation}
        </p>
      </div>

      {/* Chat Section */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); setIsChatOpen(!isChatOpen); }}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {isChatOpen ? 'Close Deep Dive' : 'Dig Deeper (Chat with AI)'}
          </button>
        </div>

        {isChatOpen && (
          <div 
            style={{ marginTop: '1rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)', padding: '1rem' }}
            onClick={(e) => e.stopPropagation()} // Prevent card selection when clicking inside chat
          >
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {chatHistory.length === 0 && (
                <p className="text-body" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                  Ask any question about this quote's meaning, history, or how to apply it in your life.
                </p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '0.9rem',
                  border: msg.role === 'model' ? '1px solid var(--color-border)' : 'none'
                }}>
                  {msg.content}
                </div>
              ))}
              {isChatLoading && (
                <div style={{ alignSelf: 'flex-start', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Meditating on answer...
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about this quote..."
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)', 
                  fontFamily: 'inherit' 
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={isChatLoading}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
