import { z } from "zod";
import { prisma } from "../db.js";
import { detectPlateau } from "../algorithms/plateauDetector.js";
import { suggestPlateauFix } from "../services/geminiExplainer.js";

export const workoutLogSchema = z.object({
  body: z.object({
    exerciseName: z.string().min(1),
    weight: z.number().positive(),
    reps: z.number().int().positive(),
    sets: z.number().int().positive(),
    date: z.string().datetime().or(z.string().date())
  })
});

export const plateauSchema = z.object({
  body: z.object({
    exerciseName: z.string().min(1),
    windowSize: z.number().int().min(2).max(12).default(5)
  })
});

export const workoutHistorySchema = z.object({
  params: z.object({
    exercise: z.string().min(1)
  })
});

export const plateauIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

export async function createWorkoutLog(req, res) {
  const input = req.validated.body;
  const log = await prisma.workoutLog.create({
    data: {
      ...input,
      userId: req.user.id,
      date: new Date(input.date)
    }
  });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: req.user.id, exerciseName: { equals: input.exerciseName, mode: "insensitive" } },
    orderBy: { date: "asc" }
  });
  const detection = detectPlateau(logs, input.exerciseName, 5);
  let flag = null;

  if (detection.plateaued) {
    const suggestion = await suggestPlateauFix(detection);
    flag = await prisma.plateauFlag.create({
      data: {
        userId: req.user.id,
        exerciseName: input.exerciseName,
        aiSuggestion: suggestion
      }
    });
  }

  res.status(201).json({ log, detection, flag });
}

export async function checkPlateau(req, res) {
  const input = req.validated.body;
  const logs = await prisma.workoutLog.findMany({
    where: { userId: req.user.id, exerciseName: { equals: input.exerciseName, mode: "insensitive" } },
    orderBy: { date: "asc" }
  });

  const detection = detectPlateau(logs, input.exerciseName, input.windowSize);
  let flag = null;

  if (detection.plateaued) {
    const suggestion = await suggestPlateauFix(detection);
    flag = await prisma.plateauFlag.create({
      data: {
        userId: req.user.id,
        exerciseName: input.exerciseName,
        aiSuggestion: suggestion
      }
    });
  }

  res.json({ detection, flag });
}

export async function listWorkoutLogs(req, res) {
  const exerciseName = req.validated.params.exercise;
  const logs = await prisma.workoutLog.findMany({
    where: { userId: req.user.id, exerciseName: { equals: exerciseName, mode: "insensitive" } },
    orderBy: { date: "asc" }
  });

  res.json(logs);
}

export async function listPlateaus(req, res) {
  const flags = await prisma.plateauFlag.findMany({
    where: { userId: req.user.id },
    orderBy: { detectedAt: "desc" }
  });

  res.json(flags);
}

export async function resolvePlateau(req, res) {
  const flag = await prisma.plateauFlag.updateMany({
    where: { id: req.validated.params.id, userId: req.user.id },
    data: { resolved: true }
  });

  if (!flag.count) {
    return res.status(404).json({ error: true, message: "Plateau flag not found.", code: "PLATEAU_NOT_FOUND" });
  }

  res.json({ ok: true });
}
