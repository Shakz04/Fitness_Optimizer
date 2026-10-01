import { z } from "zod";
import { parseNaturalLanguageConstraints } from "../services/geminiParser.js";

export const parseSchema = z.object({
  body: z.object({
    text: z.string().min(3)
  })
});

export async function parseConstraints(req, res) {
  const parsed = await parseNaturalLanguageConstraints(req.validated.body.text);
  res.json(parsed);
}
