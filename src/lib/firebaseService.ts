import { collection, addDoc, getDocs, query, orderBy, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Quote } from '../components/QuoteCard';

const QUOTES_COLLECTION = 'user_quotes';
const DAILY_QUOTES_COLLECTION = 'daily_quotes';

// Save a quote to Firestore history
export const saveQuote = async (quote: Quote, userId: string) => {
  if (!db) throw new Error("Firestore is not initialized.");
  
  try {
    const docRef = await addDoc(collection(db, QUOTES_COLLECTION), {
      userId,
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

// Retrieve history quotes for user
export const getSavedQuotes = async (userId: string): Promise<Quote[]> => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where("userId", "==", userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      quotes.push({
        id: docSnap.id,
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

// Save daily generated quotes for cloud caching
export const saveDailyQuotes = async (userId: string, dateStr: string, quotes: Quote[]) => {
  if (!db) return;
  try {
    const docId = `${userId}_${dateStr}`;
    await setDoc(doc(db, DAILY_QUOTES_COLLECTION, docId), {
      quotes,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("Error saving daily quotes cache:", e);
  }
};

// Retrieve daily quotes from cloud cache
export const getDailyQuotes = async (userId: string, dateStr: string): Promise<Quote[] | null> => {
  if (!db) return null;
  try {
    const docId = `${userId}_${dateStr}`;
    const docSnap = await getDoc(doc(db, DAILY_QUOTES_COLLECTION, docId));
    if (docSnap.exists()) {
      return docSnap.data().quotes as Quote[];
    }
    return null;
  } catch (e) {
    console.error("Error fetching daily quotes cache:", e);
    return null;
  }
};
