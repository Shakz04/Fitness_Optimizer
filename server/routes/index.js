import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMe,
  login,
  loginSchema,
  onboardingSchema,
  saveOnboarding,
  signup,
  signupSchema
} from "../controllers/authController.js";
import { listFoods, createMealPlan, getMealPlan, listMealPlans, mealPlanIdSchema, mealPlanSchema } from "../controllers/mealController.js";
import { createTrainingSplit, listTrainingSplits, trainingSplitSchema } from "../controllers/trainingController.js";
import {
  checkPlateau,
  createWorkoutLog,
  listPlateaus,
  listWorkoutLogs,
  plateauIdSchema,
  plateauSchema,
  resolvePlateau,
  workoutHistorySchema,
  workoutLogSchema
} from "../controllers/progressController.js";
import { parseConstraints, parseSchema } from "../controllers/aiController.js";

export const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.get("/foods", asyncHandler(listFoods));
router.post("/auth/signup", validate(signupSchema), asyncHandler(signup));
router.post("/auth/login", validate(loginSchema), asyncHandler(login));

router.use(authMiddleware);

router.get("/me", asyncHandler(getMe));
router.post("/onboarding", validate(onboardingSchema), asyncHandler(saveOnboarding));

router.post("/meal-plans/generate", validate(mealPlanSchema), asyncHandler(createMealPlan));
router.get("/meal-plans", asyncHandler(listMealPlans));
router.get("/meal-plans/:id", validate(mealPlanIdSchema), asyncHandler(getMealPlan));

router.post("/training-splits/generate", validate(trainingSplitSchema), asyncHandler(createTrainingSplit));
router.get("/training-splits", asyncHandler(listTrainingSplits));

router.post("/workout-logs", validate(workoutLogSchema), asyncHandler(createWorkoutLog));
router.get("/workout-logs/:exercise", validate(workoutHistorySchema), asyncHandler(listWorkoutLogs));

router.get("/plateaus", asyncHandler(listPlateaus));
router.post("/plateaus/check", validate(plateauSchema), asyncHandler(checkPlateau));
router.patch("/plateaus/:id/resolve", validate(plateauIdSchema), asyncHandler(resolvePlateau));

router.post("/parse-constraints", validate(parseSchema), asyncHandler(parseConstraints));

// Backward-compatible aliases for the original v0 frontend/API surface.
router.post("/meal-plans", validate(mealPlanSchema), asyncHandler(createMealPlan));
router.post("/training-splits", validate(trainingSplitSchema), asyncHandler(createTrainingSplit));
router.post("/ai/parse", validate(parseSchema), asyncHandler(parseConstraints));
