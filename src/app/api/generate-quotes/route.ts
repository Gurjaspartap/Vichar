import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { mood = 'inspiring' } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not set in environment variables.' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a spiritual guide. Provide 4 distinct, ${mood} Gurbani quotes.
    For each quote, provide:
    1. The Gurmukhi text.
    2. The English transliteration (Romanized).
    3. The English translation and a short, deep meaning.
    
    Format the output STRICTLY as a JSON array of objects with keys: "gurmukhi", "transliteration", "translation".
    Do not include markdown blocks or any other text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting (e.g. ```json ... ```)
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    const quotes = JSON.parse(cleanedText);

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error generating quotes:', error);
    return NextResponse.json({ error: 'Failed to generate quotes. Please try again later.' }, { status: 500 });
  }
}
