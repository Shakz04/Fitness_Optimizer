// 0/1 knapsack variant. For n foods and integer budget B, time is O(n * B)
// and space is O(B). Each food can be selected at most once; duplicate food
// rows can be supplied if larger quantities should be considered.

function scoreMacros(candidate, targets, mode) {
  if (mode === "protein") return candidate.protein;

  const proteinGap = Math.abs((targets.protein ?? 0) - candidate.protein) * 4;
  const carbsGap = Math.abs((targets.carbs ?? 0) - candidate.carbs);
  const fatGap = Math.abs((targets.fat ?? 0) - candidate.fat) * 2;
  const calorieGap = Math.abs((targets.calories ?? 0) - candidate.calories) / 20;
  return -(proteinGap + carbsGap + fatGap + calorieGap);
}

function betterPlan(a, b, targets, objective) {
  if (!a) return b;
  if (!b) return a;
  const aScore = scoreMacros(a, targets, objective);
  const bScore = scoreMacros(b, targets, objective);
  if (bScore !== aScore) return bScore > aScore ? b : a;
  if (b.protein !== a.protein) return b.protein > a.protein ? b : a;
  if (b.calories !== a.calories) return b.calories < a.calories ? b : a;
  return b.cost < a.cost ? b : a;
}

function toPlan(food) {
  return {
    items: [{ ...food, quantity: 1 }],
    cost: Math.round(food.costPerServing),
    protein: Number(food.protein),
    carbs: Number(food.carbs),
    fat: Number(food.fat),
    calories: Number(food.calories)
  };
}

function combine(plan, food) {
  return {
    items: [...plan.items, { ...food, quantity: 1 }],
    cost: plan.cost + Math.round(food.costPerServing),
    protein: plan.protein + Number(food.protein),
    carbs: plan.carbs + Number(food.carbs),
    fat: plan.fat + Number(food.fat),
    calories: plan.calories + Number(food.calories)
  };
}

function compressItems(items) {
  const byId = new Map();
  for (const item of items) {
    const key = item.id ?? item.name;
    const existing = byId.get(key);
    if (existing) existing.quantity += item.quantity;
    else byId.set(key, { ...item });
  }
  return [...byId.values()];
}

export function optimizeMealPlan({ foods, budget, targets, calorieCeiling, objective = "closestMacros" }) {
  const budgetUnits = Math.floor(Number(budget));
  if (!Number.isFinite(budgetUnits) || budgetUnits < 0) {
    throw new Error("Budget must be a non-negative number.");
  }

  const ceiling = calorieCeiling ?? targets?.calories ?? Number.POSITIVE_INFINITY;
  const dp = Array.from({ length: budgetUnits + 1 }, () => null);

  for (const food of foods) {
    const cost = Math.round(Number(food.costPerServing));
    if (!Number.isFinite(cost) || cost <= 0 || cost > budgetUnits) continue;

    for (let currentBudget = budgetUnits; currentBudget >= cost; currentBudget -= 1) {
      const base = currentBudget === cost ? { items: [], cost: 0, protein: 0, carbs: 0, fat: 0, calories: 0 } : dp[currentBudget - cost];
      if (!base) continue;
      const candidate = combine(base, food);
      if (candidate.calories > ceiling) continue;
      dp[currentBudget] = betterPlan(dp[currentBudget], candidate, targets ?? {}, objective);
    }
  }

  const best = dp.reduce((winner, plan) => betterPlan(winner, plan, targets ?? {}, objective), null);
  if (!best) {
    return { items: [], totalCost: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0 };
  }

  return {
    items: compressItems(best.items),
    totalCost: best.cost,
    totalProtein: Number(best.protein.toFixed(2)),
    totalCarbs: Number(best.carbs.toFixed(2)),
    totalFat: Number(best.fat.toFixed(2)),
    totalCalories: best.calories
  };
}
