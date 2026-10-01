# Architecture.md — Personalized Fitness Macro & Program Optimizer

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| AI | Gemini API (server-side only) |
| Validation | Zod |
| Hosting (backend) | Render / Railway (free tier) |
| Hosting (frontend) | Vercel / Netlify |

---

## High-Level Flow

```
User → React Frontend
          ↓ (REST API calls, JWT in headers)
Express Backend
          ↓
   ┌──────┴───────┐
   ↓              ↓
/algorithms   /services (Gemini)
(pure logic)  (NLP parsing, explanations)
   ↓              ↓
   └──────┬───────┘
          ↓
   Prisma ORM → PostgreSQL (Neon)
```

### Example: Meal Plan Generation Flow
1. User submits budget + macros (or free text) via frontend form
2. If free text → `/services/geminiParser.js` converts it to structured JSON
3. Controller passes structured constraints to `/algorithms/knapsack.js`
4. Knapsack DP returns the optimal food combination (pure function, no side effects)
5. Controller saves result via Prisma to `meal_plans` + `meal_plan_items`
6. Controller calls `/services/geminiExplainer.js` to generate a coach-style explanation
7. Response sent to frontend: meal plan data + explanation text

### Example: Plateau Detection Flow
1. User logs a new workout entry (weight, reps, exercise, date)
2. Backend fetches last N sessions for that exercise via Prisma
3. `/algorithms/plateauDetector.js` runs sliding window logic — pure, deterministic, no API calls
4. If plateau detected → saved to `plateau_flags` table
5. Only then, `/services/geminiExplainer.js` is called to generate a suggestion
6. Suggestion saved alongside the flag, returned to frontend

---

## Folder & File Structure

```
fitness-optimizer/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js                  # seeds 40-50 Indian foods
│   │   └── migrations/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── knapsack.js          # meal plan DP logic
│   │   │   ├── knapsack.test.js
│   │   │   ├── splitGenerator.js    # training split greedy/graph logic
│   │   │   ├── splitGenerator.test.js
│   │   │   ├── plateauDetector.js   # sliding window logic
│   │   │   └── plateauDetector.test.js
│   │   ├── services/
│   │   │   ├── geminiParser.js      # free text → structured JSON
│   │   │   └── geminiExplainer.js   # algorithm output → natural language
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── mealPlanController.js
│   │   │   ├── trainingSplitController.js
│   │   │   ├── workoutLogController.js
│   │   │   └── plateauController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── mealPlanRoutes.js
│   │   │   ├── trainingSplitRoutes.js
│   │   │   ├── workoutLogRoutes.js
│   │   │   └── plateauRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── validation/
│   │   │   └── schemas.js           # zod schemas per route
│   │   ├── prismaClient.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MealPlan.jsx
│   │   │   ├── TrainingSplit.jsx
│   │   │   ├── WorkoutLogger.jsx
│   │   │   └── History.jsx
│   │   ├── components/
│   │   │   ├── StatCard.jsx
│   │   │   ├── MealPlanCard.jsx
│   │   │   ├── SplitCalendar.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   └── PlateauAlert.jsx
│   │   ├── api/
│   │   │   └── client.js            # axios instance with JWT interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── project.md
├── architecture.md
├── rules.md
├── phases.md
├── design.md
└── memory.md
```

---

## Database Schema (Prisma / PostgreSQL)

- **users** — id, name, email, password_hash, age, weight, height, activity_level, diet_preference, training_experience, created_at
- **foods** — id, name, cost_per_serving, protein, carbs, fat, calories, category, is_common_indian_food
- **meal_plans** — id, user_id (FK), date, total_cost, total_protein, total_carbs, total_fat, total_calories, generated_explanation
- **meal_plan_items** — id, meal_plan_id (FK), food_id (FK), quantity
- **training_splits** — id, user_id (FK), days_per_week, goal, created_at
- **training_split_days** — id, training_split_id (FK), day_number, muscle_groups, suggested_exercises (jsonb)
- **workout_logs** — id, user_id (FK), exercise_name, weight, reps, sets, date
- **plateau_flags** — id, user_id (FK), exercise_name, detected_at, ai_suggestion, resolved (boolean)

Foreign keys on all `user_id` columns; index `user_id` on high-traffic tables (`workout_logs`, `meal_plans`).

---

## API Route Map (high level)

```
POST   /api/auth/signup
POST   /api/auth/login

POST   /api/onboarding

POST   /api/meal-plans/generate
GET    /api/meal-plans
GET    /api/meal-plans/:id

POST   /api/training-splits/generate
GET    /api/training-splits

POST   /api/workout-logs
GET    /api/workout-logs/:exercise

GET    /api/plateaus
PATCH  /api/plateaus/:id/resolve

POST   /api/parse-constraints        # free text → structured JSON (Gemini)
```
