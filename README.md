# Personalized Fitness Macro & Program Optimizer

A full-stack fitness planning app with:

- React + Tailwind dashboard
- Node.js + Express API
- PostgreSQL via Prisma
- Gemini API for natural-language parsing and coach-style explanations
- Pure, unit-tested DSA modules for optimization and detection

## Project Structure

```text
client/                 React + Tailwind frontend
server/
  algorithms/           Pure DSA logic, no DB or AI calls
  controllers/          Request orchestration
  middleware/           Validation and error handling
  routes/               REST API routes
  services/             Gemini integration only
  tests/                Node test runner tests
prisma/
  schema.prisma         PostgreSQL schema
  migrations/           Initial SQL migration
  seed.js               50 common Indian foods + demo user
```

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitness_optimizer?schema=public"
GEMINI_API_KEY="your-key"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

3. Install dependencies:

```bash
npm install
```

4. Run migrations and seed foods:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000/api`

## Verification

Pure algorithm tests do not require PostgreSQL or Gemini:

```bash
node --test server/tests/algorithms.test.js
```

Current test coverage:

- Meal plan optimizer respects budget/calorie ceiling and favors protein
- Training split generator avoids back-to-back posterior-chain days when possible
- Plateau detector flags stagnant lift windows

## API Endpoints

```text
GET  /api/health
GET  /api/foods
POST /api/ai/parse
POST /api/meal-plans
POST /api/training-splits
POST /api/workout-logs
POST /api/plateaus/check
```

## Algorithms

### Meal Plan Optimizer

File: `server/algorithms/knapsack.js`

Uses a 0/1 knapsack-style dynamic programming table over integer budget units.

- Input: foods, daily budget, target macros, calorie ceiling
- Constraint: total cost must stay within budget and calories must not exceed ceiling
- Objective: either maximize protein or minimize macro distance from targets
- Time complexity: `O(n * B)`, where `n` is number of foods and `B` is budget
- Space complexity: `O(B)`

Example:

```js
optimizeMealPlan({
  budget: 80,
  calorieCeiling: 700,
  objective: "protein",
  targets: { protein: 45, carbs: 80, fat: 20, calories: 650 },
  foods
});
```

### Training Split Generator

File: `server/algorithms/splitGenerator.js`

Uses a greedy constraint scheduler. Muscle groups are treated as nodes with a recovery rule that prevents heavy posterior-chain sessions from being placed back-to-back when another template is available.

- Input: training days per week, goal, equipment
- Output: day number, title, muscle groups, suggested exercises
- Time complexity: `O(d * t)`, where `d` is training days and `t` is available templates
- Space complexity: `O(d)`

### Plateau Detector

File: `server/algorithms/plateauDetector.js`

Uses a sliding window over the last `N` sessions for a lift. A plateau is detected when neither weight nor estimated session volume (`weight * reps`) improves inside the window.

- Input: workout logs, exercise name, window size
- Output: plateau flag, reason, sessions analyzed
- Sorting complexity: `O(m log m)` for `m` logs of the exercise
- Window scan complexity: `O(N)`

## Gemini Usage

Gemini is used only in `server/services`:

- `geminiParser.js`: converts natural language into structured constraints
- `geminiExplainer.js`: explains algorithmic meal plans and training splits
- Plateau suggestions are generated after deterministic plateau detection

The optimizer, split scheduler, and plateau detector never call Gemini.

If `GEMINI_API_KEY` is missing, the API returns safe fallback explanations so local development still works.

## Notes

- The demo frontend uses `userId: 1`, created by the seed script as `demo@fitness.local`.
- Food macro values are practical approximations per common serving. For production nutrition use, connect a verified food database and standardize serving sizes.
- Password hashing/auth tables are modeled, but full authentication is intentionally not implemented yet.
