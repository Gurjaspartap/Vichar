import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { quote, message, history = [] } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key missing" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
You are a wise and compassionate spiritual guide specializing in Gurbani.

The user is asking about this quote:

Gurmukhi:
${quote.gurmukhi}

Translation:
${quote.translation}

Answer thoughtfully, spiritually, and concisely.
`,
    });

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: String(msg.content),
          },
        ],
      })),
    });

    const result = await chat.sendMessage(message);

    return NextResponse.json({
      response: result.response.text(),
    });

  } catch (error) {
    console.error("Error in chat-quote API:", error);

    return NextResponse.json(
      {
        error: "Failed to communicate with AI",
      },
      {
        status: 500,
      }
    );
  }
}