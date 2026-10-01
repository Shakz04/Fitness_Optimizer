import { z } from "zod";
import { prisma } from "../db.js";
import { generateTrainingSplit } from "../algorithms/splitGenerator.js";
import { explainTrainingSplit } from "../services/geminiExplainer.js";

export const trainingSplitSchema = z.object({
  body: z.object({
    daysPerWeek: z.number().int().min(1).max(7),
    goal: z.enum(["strength", "hypertrophy", "powerlifting"]),
    equipment: z.array(z.enum(["barbell", "dumbbell", "bodyweight"])).default(["bodyweight"]),
    constraints: z.record(z.any()).optional(),
    persist: z.boolean().default(false)
  })
});

export async function createTrainingSplit(req, res) {
  const input = req.validated.body;
  const split = generateTrainingSplit(input);
  const explanation = await explainTrainingSplit(split, input.constraints);
  let savedSplit = null;

  if (input.persist) {
    savedSplit = await prisma.trainingSplit.create({
      data: {
        userId: req.user.id,
        daysPerWeek: input.daysPerWeek,
        goal: input.goal,
        days: {
          create: split.map((day) => ({
            dayNumber: day.dayNumber,
            muscleGroups: day.muscleGroups,
            suggestedExercises: day.suggestedExercises
          }))
        }
      },
      include: { days: true }
    });
  }

  res.status(201).json({ split, explanation, savedSplit });
}

export async function listTrainingSplits(req, res) {
  const splits = await prisma.trainingSplit.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { days: { orderBy: { dayNumber: "asc" } } }
  });

  res.json(splits);
}
