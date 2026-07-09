'use client';
import React from 'react';

export interface Quote {
  id?: string; // Optional for when it comes from DB
  gurmukhi: string;
  transliteration: string;
  translation: string;
  timestamp?: number; // For saved quotes
}

interface QuoteCardProps {
  quote: Quote;
  onSelect?: (quote: Quote) => void;
  isSelected?: boolean;
  isSavedMode?: boolean;
}

export default function QuoteCard({ quote, onSelect, isSelected, isSavedMode }: QuoteCardProps) {
  
  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the quote when clicking the audio button
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const textToRead = `${quote.gurmukhi}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pa-IN';
      utterance.rate = 0.85; // Slightly slower for better pacing in Punjabi
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
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
      onClick={() => onSelect && onSelect(quote)}
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
          boxShadow: 'var(--shadow-sm)'
        }}
        title="Listen to translation"
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
        <p className="text-body" style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>
          {quote.translation}
        </p>
      </div>
    </div>
  );
}
