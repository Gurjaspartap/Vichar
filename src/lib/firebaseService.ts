import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';
import { Quote } from '../components/QuoteCard';

const QUOTES_COLLECTION = 'user_quotes';

// Save a quote to Firestore
export const saveQuote = async (quote: Quote) => {
  if (!db) throw new Error("Firestore is not initialized.");
  
  try {
    const docRef = await addDoc(collection(db, QUOTES_COLLECTION), {
      gurmukhi: quote.gurmukhi,
      transliteration: quote.transliteration,
      translation: quote.translation,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Retrieve quotes from Firestore
export const getSavedQuotes = async (): Promise<Quote[]> => {
  if (!db) return [];
  
  try {
    const q = query(collection(db, QUOTES_COLLECTION), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      quotes.push({
        id: doc.id,
        gurmukhi: data.gurmukhi,
        transliteration: data.transliteration,
        translation: data.translation,
        timestamp: data.timestamp
      });
    });
    return quotes;
  } catch (e) {
    console.error("Error fetching quotes: ", e);
    return [];
  }
};
