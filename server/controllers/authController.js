import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db.js";

const onboardingShape = {
  age: z.number().int().min(13).max(100).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "athlete"]).optional(),
  dietPreference: z.enum(["veg", "non_veg", "eggetarian", "flexible"]).optional(),
  trainingExperience: z.enum(["beginner", "intermediate", "advanced"]).optional()
};

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    ...onboardingShape
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const onboardingSchema = z.object({
  body: z.object(onboardingShape).refine((value) => Object.keys(value).length > 0, {
    message: "At least one onboarding field is required."
  })
});

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.statusCode = 500;
    error.code = "JWT_SECRET_MISSING";
    throw error;
  }
}

function signToken(user) {
  requireJwtSecret();
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: "7d"
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    weight: user.weight === null || user.weight === undefined ? null : Number(user.weight),
    height: user.height === null || user.height === undefined ? null : Number(user.height),
    activityLevel: user.activityLevel,
    dietPreference: user.dietPreference,
    trainingExperience: user.trainingExperience,
    createdAt: user.createdAt
  };
}

export async function signup(req, res) {
  const input = req.validated.body;
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    return res.status(409).json({ error: true, message: "Email is already registered.", code: "EMAIL_EXISTS" });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      age: input.age,
      weight: input.weight,
      height: input.height,
      activityLevel: input.activityLevel,
      dietPreference: input.dietPreference,
      trainingExperience: input.trainingExperience
    }
  });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const input = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ error: true, message: "Invalid email or password.", code: "INVALID_CREDENTIALS" });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function getMe(req, res) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
  res.json({ user: publicUser(user) });
}

export async function saveOnboarding(req, res) {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.validated.body
  });

  res.json({ user: publicUser(user) });
}
