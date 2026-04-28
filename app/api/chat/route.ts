import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { message, contextTitle } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build context
    const systemPrompt = `You are the AI assistant for "${contextTitle}". Respond helpfully to the user's message. Keep the response concise and friendly.`;
    const prompt = `System: ${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
