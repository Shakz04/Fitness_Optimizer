import test from "node:test";
import assert from "node:assert/strict";
import { optimizeMealPlan } from "../algorithms/knapsack.js";
import { generateTrainingSplit } from "../algorithms/splitGenerator.js";
import { detectPlateau } from "../algorithms/plateauDetector.js";

test("optimizeMealPlan respects budget and calorie ceiling while favoring protein", () => {
  const result = optimizeMealPlan({
    budget: 80,
    calorieCeiling: 700,
    objective: "protein",
    targets: { protein: 45, carbs: 80, fat: 20, calories: 650 },
    foods: [
      { id: 1, name: "Rice", costPerServing: 20, protein: 4, carbs: 45, fat: 0.5, calories: 210 },
      { id: 2, name: "Dal", costPerServing: 25, protein: 9, carbs: 28, fat: 1, calories: 170 },
      { id: 3, name: "Chicken Breast", costPerServing: 55, protein: 31, carbs: 0, fat: 3.6, calories: 165 },
      { id: 4, name: "Paneer", costPerServing: 45, protein: 18, carbs: 3, fat: 20, calories: 265 }
    ]
  });

  assert.equal(result.totalCost <= 80, true);
  assert.equal(result.totalCalories <= 700, true);
  assert.equal(result.items.some((item) => item.name === "Chicken Breast"), true);
});

test("optimizeMealPlan returns an empty plan when no food fits", () => {
  const result = optimizeMealPlan({
    budget: 10,
    calorieCeiling: 100,
    targets: { protein: 20, carbs: 20, fat: 5, calories: 100 },
    foods: [{ id: 1, name: "Paneer", costPerServing: 45, protein: 18, carbs: 3, fat: 20, calories: 265 }]
  });

  assert.deepEqual(result.items, []);
  assert.equal(result.totalCost, 0);
});

test("optimizeMealPlan rejects invalid budgets", () => {
  assert.throws(
    () => optimizeMealPlan({ budget: -1, targets: {}, foods: [] }),
    /Budget must be a non-negative number/
  );
});

test("generateTrainingSplit avoids back-to-back heavy posterior-chain days when possible", () => {
  const split = generateTrainingSplit({ daysPerWeek: 4, goal: "powerlifting", equipment: ["barbell"] });
  assert.equal(split.length, 4);
  for (let index = 1; index < split.length; index += 1) {
    const previous = split[index - 1].muscleGroups;
    const current = split[index].muscleGroups;
    const previousPosterior = previous.some((group) => ["hamstrings", "glutes", "back"].includes(group));
    const currentPosterior = current.some((group) => ["hamstrings", "glutes", "back"].includes(group));
    assert.equal(previousPosterior && currentPosterior, false);
  }
});

test("generateTrainingSplit clamps requested days to one through seven", () => {
  assert.equal(generateTrainingSplit({ daysPerWeek: 12, goal: "hypertrophy", equipment: ["bodyweight"] }).length, 7);
  assert.equal(generateTrainingSplit({ daysPerWeek: 0, goal: "hypertrophy", equipment: ["bodyweight"] }).length, 1);
});

test("generateTrainingSplit falls back to hypertrophy templates for unknown goals", () => {
  const split = generateTrainingSplit({ daysPerWeek: 1, goal: "unknown", equipment: ["dumbbell"] });
  assert.equal(split[0].title, "Push");
  assert.equal(split[0].suggestedExercises.some((exercise) => exercise.includes("Dumbbell")), true);
});

test("detectPlateau flags stagnant lift windows", () => {
  const logs = Array.from({ length: 5 }, (_, index) => ({
    exerciseName: "Bench Press",
    weight: 60,
    reps: 5,
    sets: 3,
    date: `2026-01-0${index + 1}`
  }));

  const result = detectPlateau(logs, "Bench Press", 5);
  assert.equal(result.plateaued, true);
});

test("detectPlateau does not flag when there are too few sessions", () => {
  const result = detectPlateau([
    { exerciseName: "Squat", weight: 100, reps: 5, date: "2026-01-01" }
  ], "Squat", 5);

  assert.equal(result.plateaued, false);
  assert.match(result.reason, /Not enough/);
});

test("detectPlateau does not flag a progressing lift", () => {
  const logs = [80, 82, 82, 85, 87].map((weight, index) => ({
    exerciseName: "Deadlift",
    weight,
    reps: 5,
    sets: 3,
    date: `2026-01-0${index + 1}`
  }));

  const result = detectPlateau(logs, "Deadlift", 5);
  assert.equal(result.plateaued, false);
});
