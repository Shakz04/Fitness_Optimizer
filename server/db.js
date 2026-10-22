import { PrismaClient } from "@prisma/client";
import { devStore } from "./devStore.js";

const client = new PrismaClient();
let usingDevStore = false;

function isDatabaseStartupError(error) {
  return (
    error?.name === "PrismaClientInitializationError" ||
    error?.code === "P1000" ||
    error?.code === "P1001" ||
    error?.message?.includes("Authentication failed against database server") ||
    error?.message?.includes("Can't reach database server")
  );
}

function delegate(modelName) {
  return new Proxy(client[modelName], {
    get(target, prop) {
      const fallback = devStore[modelName]?.[prop];
      const value = target[prop];

      if (typeof value !== "function") {
        return value;
      }

      return async (...args) => {
        if (usingDevStore && typeof fallback === "function") {
          return fallback(...args);
        }

        try {
          return await value.apply(target, args);
        } catch (error) {
          if (process.env.NODE_ENV === "production" || !isDatabaseStartupError(error) || typeof fallback !== "function") {
            throw error;
          }

          usingDevStore = true;
          console.warn("Prisma database unavailable; using in-memory dev store for this server session.");
          return fallback(...args);
        }
      };
    }
  });
}

export const prisma = {
  user: delegate("user"),
  food: delegate("food"),
  mealPlan: delegate("mealPlan"),
  trainingSplit: delegate("trainingSplit"),
  workoutLog: delegate("workoutLog"),
  plateauFlag: delegate("plateauFlag"),
  $disconnect: (...args) => client.$disconnect(...args)
};
