import { generateText } from "./geminiClient.js";

export async function explainMealPlan(plan, constraints = {}) {
  const response = await generateText(`
You are a concise Indian fitness coach. Explain this algorithm-generated meal plan.
Do not change the selected foods or macros.
Plan: ${JSON.stringify(plan)}
User constraints: ${JSON.stringify(constraints)}
`);
  return response ?? "This plan was generated algorithmically to fit your budget, calories, and macro priorities.";
}

export async function explainTrainingSplit(split, constraints = {}) {
  const response = await generateText(`
Explain this weekly training split in a practical coach-like tone.
Do not add extra training days.
Split: ${JSON.stringify(split)}
User constraints: ${JSON.stringify(constraints)}
`);
  return response ?? "This split balances your goal with recovery constraints and available equipment.";
}

export async function suggestPlateauFix(flag) {
  const response = await generateText(`
A plateau was detected by deterministic sliding-window logic. Give one concise suggestion.
Plateau data: ${JSON.stringify(flag)}
`);
  return response ?? "Consider a lighter deload week, then return with a small load or rep progression.";
}
