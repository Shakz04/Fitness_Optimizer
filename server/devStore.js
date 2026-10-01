const now = () => new Date();

const foods = [
  ["Cooked Rice", 12, 2.7, 28, 0.3, 130, "veg"],
  ["Roti", 8, 3.1, 18, 3.7, 120, "veg"],
  ["Oats", 18, 5, 27, 3, 154, "veg"],
  ["Moong Dal", 16, 7, 19, 0.8, 110, "veg"],
  ["Rajma", 24, 8.7, 22.8, 0.5, 127, "veg"],
  ["Soy Chunks", 20, 26, 16, 0.5, 172, "veg"],
  ["Paneer", 45, 18, 3, 20, 265, "veg"],
  ["Greek Yogurt", 45, 10, 4, 0.5, 60, "veg"],
  ["Egg Whole", 8, 6.3, 0.4, 5, 72, "egg"],
  ["Chicken Breast", 60, 31, 0, 3.6, 165, "non_veg"],
  ["Tuna", 80, 25, 0, 1, 110, "non_veg"],
  ["Khichdi", 25, 8, 35, 4, 210, "veg"]
].map(([name, costPerServing, protein, carbs, fat, calories, category], index) => ({
  id: index + 1,
  name,
  costPerServing,
  protein,
  carbs,
  fat,
  calories,
  category,
  isCommonIndianFood: true
}));

const users = [{
  id: 1,
  name: "Demo User",
  email: "demo@fitness.local",
  passwordHash: "$2b$10$C4qO8W8q9v4X9WyOy2LBUeaUx2/pY5AfE1PQRnrYo9P2kveUG5xT2",
  age: 21,
  weight: 72,
  height: 175,
  activityLevel: "moderate",
  dietPreference: "flexible",
  trainingExperience: "intermediate",
  createdAt: now()
}];

const mealPlans = [];
const trainingSplits = [];
const workoutLogs = [];
const plateauFlags = [];

let nextUserId = 2;
let nextMealPlanId = 1;
let nextMealPlanItemId = 1;
let nextTrainingSplitId = 1;
let nextTrainingSplitDayId = 1;
let nextWorkoutLogId = 1;
let nextPlateauFlagId = 1;

function findUser(where) {
  if (where?.email) return users.find(byEmail(where.email)) ?? null;
  if (where?.id) return users.find(byId(where.id)) ?? null;
  return null;
}

function byId(id) {
  return (item) => item.id === Number(id);
}

function byEmail(email) {
  return (user) => user.email.toLowerCase() === String(email).toLowerCase();
}

function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function includeMealPlanItems(plan) {
  return {
    ...plan,
    items: plan.items.map((item) => ({
      ...item,
      food: foods.find(byId(item.foodId))
    }))
  };
}

export const devStore = {
  user: {
    async findUnique(args) {
      return findUser(args.where);
    },
    async findUniqueOrThrow(args) {
      const user = findUser(args.where);
      if (!user) throw new Error("User not found");
      return user;
    },
    async create(args) {
      const user = { id: nextUserId++, createdAt: now(), ...args.data };
      users.push(user);
      return user;
    },
    async update(args) {
      const user = users.find(byId(args.where.id));
      if (!user) throw new Error("User not found");
      Object.assign(user, args.data);
      return user;
    }
  },
  food: {
    async findMany(args = {}) {
      const selected = args.where?.id?.in?.length
        ? foods.filter((food) => args.where.id.in.includes(food.id))
        : foods;
      return args.orderBy?.name ? sortByName(selected) : [...selected];
    }
  },
  mealPlan: {
    async create(args) {
      const plan = {
        id: nextMealPlanId++,
        userId: args.data.userId,
        date: now(),
        totalCost: args.data.totalCost,
        totalProtein: args.data.totalProtein,
        totalCarbs: args.data.totalCarbs,
        totalFat: args.data.totalFat,
        totalCalories: args.data.totalCalories,
        generatedExplanation: args.data.generatedExplanation,
        items: (args.data.items?.create ?? []).map((item) => ({
          id: nextMealPlanItemId++,
          mealPlanId: nextMealPlanId - 1,
          foodId: item.foodId,
          quantity: item.quantity
        }))
      };
      mealPlans.push(plan);
      return includeMealPlanItems(plan);
    },
    async findMany(args) {
      return mealPlans
        .filter((plan) => plan.userId === args.where.userId)
        .sort((a, b) => b.date - a.date)
        .map(includeMealPlanItems);
    },
    async findFirst(args) {
      const plan = mealPlans.find((item) => item.id === args.where.id && item.userId === args.where.userId);
      return plan ? includeMealPlanItems(plan) : null;
    }
  },
  trainingSplit: {
    async create(args) {
      const split = {
        id: nextTrainingSplitId++,
        userId: args.data.userId,
        daysPerWeek: args.data.daysPerWeek,
        goal: args.data.goal,
        createdAt: now(),
        days: (args.data.days?.create ?? []).map((day) => ({
          id: nextTrainingSplitDayId++,
          trainingSplitId: nextTrainingSplitId - 1,
          ...day
        }))
      };
      trainingSplits.push(split);
      return split;
    },
    async findMany(args) {
      return trainingSplits
        .filter((split) => split.userId === args.where.userId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((split) => ({ ...split, days: [...split.days].sort((a, b) => a.dayNumber - b.dayNumber) }));
    }
  },
  workoutLog: {
    async create(args) {
      const log = { id: nextWorkoutLogId++, ...args.data };
      workoutLogs.push(log);
      return log;
    },
    async findMany(args) {
      const exercise = args.where.exerciseName.equals.toLowerCase();
      return workoutLogs
        .filter((log) => log.userId === args.where.userId && log.exerciseName.toLowerCase() === exercise)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  },
  plateauFlag: {
    async create(args) {
      const flag = { id: nextPlateauFlagId++, detectedAt: now(), resolved: false, ...args.data };
      plateauFlags.push(flag);
      return flag;
    },
    async findMany(args) {
      return plateauFlags
        .filter((flag) => flag.userId === args.where.userId)
        .sort((a, b) => b.detectedAt - a.detectedAt);
    },
    async updateMany(args) {
      const matches = plateauFlags.filter((flag) => flag.id === args.where.id && flag.userId === args.where.userId);
      matches.forEach((flag) => Object.assign(flag, args.data));
      return { count: matches.length };
    }
  }
};
