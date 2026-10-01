CREATE TYPE "FoodCategory" AS ENUM ('veg', 'non_veg', 'egg');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "diet_preference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "foods" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "cost_per_serving" DECIMAL(8,2) NOT NULL,
  "protein" DECIMAL(8,2) NOT NULL,
  "carbs" DECIMAL(8,2) NOT NULL,
  "fat" DECIMAL(8,2) NOT NULL,
  "calories" INTEGER NOT NULL,
  "category" "FoodCategory" NOT NULL,
  "is_common_indian_food" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "meal_plans" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "total_cost" DECIMAL(10,2) NOT NULL,
  "total_protein" DECIMAL(10,2) NOT NULL,
  "total_carbs" DECIMAL(10,2) NOT NULL,
  "total_fat" DECIMAL(10,2) NOT NULL,
  "total_calories" INTEGER NOT NULL,
  "generated_explanation" TEXT
);

CREATE TABLE "meal_plan_items" (
  "id" SERIAL PRIMARY KEY,
  "meal_plan_id" INTEGER NOT NULL REFERENCES "meal_plans"("id") ON DELETE CASCADE,
  "food_id" INTEGER NOT NULL REFERENCES "foods"("id") ON DELETE RESTRICT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "meal_plan_items_meal_plan_id_food_id_key" UNIQUE ("meal_plan_id", "food_id")
);

CREATE TABLE "training_splits" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "days_per_week" INTEGER NOT NULL,
  "goal" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "training_split_days" (
  "id" SERIAL PRIMARY KEY,
  "training_split_id" INTEGER NOT NULL REFERENCES "training_splits"("id") ON DELETE CASCADE,
  "day_number" INTEGER NOT NULL,
  "muscle_groups" TEXT[] NOT NULL,
  "suggested_exercises" JSONB NOT NULL,
  CONSTRAINT "training_split_days_training_split_id_day_number_key" UNIQUE ("training_split_id", "day_number")
);

CREATE TABLE "workout_logs" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "exercise_name" TEXT NOT NULL,
  "weight" DECIMAL(8,2) NOT NULL,
  "reps" INTEGER NOT NULL,
  "sets" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "plateau_flags" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "exercise_name" TEXT NOT NULL,
  "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ai_suggestion" TEXT
);

CREATE INDEX "foods_category_idx" ON "foods"("category");
CREATE INDEX "meal_plans_user_id_idx" ON "meal_plans"("user_id");
CREATE INDEX "meal_plans_date_idx" ON "meal_plans"("date");
CREATE INDEX "meal_plan_items_meal_plan_id_idx" ON "meal_plan_items"("meal_plan_id");
CREATE INDEX "meal_plan_items_food_id_idx" ON "meal_plan_items"("food_id");
CREATE INDEX "training_splits_user_id_idx" ON "training_splits"("user_id");
CREATE INDEX "training_split_days_training_split_id_idx" ON "training_split_days"("training_split_id");
CREATE INDEX "workout_logs_user_id_idx" ON "workout_logs"("user_id");
CREATE INDEX "workout_logs_user_id_exercise_name_date_idx" ON "workout_logs"("user_id", "exercise_name", "date");
CREATE INDEX "plateau_flags_user_id_idx" ON "plateau_flags"("user_id");
CREATE INDEX "plateau_flags_user_id_exercise_name_idx" ON "plateau_flags"("user_id", "exercise_name");
