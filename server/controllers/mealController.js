import { z } from "zod";
import { prisma } from "../db.js";
import { optimizeMealPlan } from "../algorithms/knapsack.js";
import { explainMealPlan } from "../services/geminiExplainer.js";

export const mealPlanSchema = z.object({
  body: z.object({
    budget: z.number().positive(),
    calorieCeiling: z.number().positive().optional(),
    objective: z.enum(["protein", "closestMacros"]).default("closestMacros"),
    targets: z.object({
      protein: z.number().nonnegative(),
      carbs: z.number().nonnegative(),
      fat: z.number().nonnegative(),
      calories: z.number().positive()
    }),
    foodIds: z.array(z.number().int().positive()).optional(),
    foods: z.array(z.object({
      id: z.number().int().positive().optional(),
      name: z.string(),
      costPerServing: z.number().positive(),
      protein: z.number().nonnegative(),
      carbs: z.number().nonnegative(),
      fat: z.number().nonnegative(),
      calories: z.number().positive(),
      category: z.string().optional()
    })).optional(),
    constraints: z.record(z.any()).optional(),
    persist: z.boolean().default(false)
  })
});

export async function listFoods(req, res) {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });
  res.json(foods);
}

export async function createMealPlan(req, res) {
  const input = req.validated.body;
  let foods = input.foods;

  if (!foods?.length) {
    foods = await prisma.food.findMany({
      where: input.foodIds?.length ? { id: { in: input.foodIds } } : undefined
    });
  }

  const plan = optimizeMealPlan({
    foods: foods.map((food) => ({
      ...food,
      costPerServing: Number(food.costPerServing),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fat: Number(food.fat)
    })),
    budget: input.budget,
    targets: input.targets,
    calorieCeiling: input.calorieCeiling,
    objective: input.objective
  });

  const explanation = await explainMealPlan(plan, input.constraints);
  let savedPlan = null;

  if (input.persist) {
    savedPlan = await prisma.mealPlan.create({
      data: {
        userId: req.user.id,
        totalCost: plan.totalCost,
        totalProtein: plan.totalProtein,
        totalCarbs: plan.totalCarbs,
        totalFat: plan.totalFat,
        totalCalories: plan.totalCalories,
        generatedExplanation: explanation,
        items: {
          create: plan.items
            .filter((item) => item.id)
            .map((item) => ({ foodId: item.id, quantity: item.quantity }))
        }
      },
      include: { items: { include: { food: true } } }
    });
  }

  res.status(201).json({ plan, explanation, savedPlan });
}

export async function listMealPlans(req, res) {
  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "desc" },
    include: { items: { include: { food: true } } }
  });

  res.json(mealPlans);
}

export async function getMealPlan(req, res) {
  const mealPlan = await prisma.mealPlan.findFirst({
    where: { id: Number(req.validated.params.id), userId: req.user.id },
    include: { items: { include: { food: true } } }
  });

  if (!mealPlan) {
    return res.status(404).json({ error: true, message: "Meal plan not found.", code: "MEAL_PLAN_NOT_FOUND" });
  }

  res.json(mealPlan);
}

export const mealPlanIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});
