import { GoogleGenerativeAI } from "@google/generative-ai";

let model;

export function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("replace-with")) return null;
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash" });
  }
  return model;
}

export async function generateText(prompt) {
  const gemini = getGeminiModel();
  if (!gemini) return null;
  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn(`Gemini request failed: ${error.message}`);
    return null;
  }
}
