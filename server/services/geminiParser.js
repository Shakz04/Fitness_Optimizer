import { generateText } from "./geminiClient.js";

export async function parseNaturalLanguageConstraints(text) {
  const fallback = { rawText: text, diet: null, exclusions: [], trainingTime: null, goal: null };
  const response = await generateText(`
Extract fitness planning constraints as strict JSON only.
Input: ${text}
Schema: {"diet": string|null, "exclusions": string[], "trainingTime": string|null, "goal": string|null, "notes": string[]}
`);

  if (!response) return fallback;

  try {
    return JSON.parse(response.replace(/```json|```/g, "").trim());
  } catch {
    return fallback;
  }
}
