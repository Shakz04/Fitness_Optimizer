# Memory.md - Build Progress Tracker

**Purpose:** This file must be updated after every completed file/phase so any AI agent or Saksham picking this project back up knows exactly what's done and what's next.

---

## How To Update This File

After completing any task:
1. Move the item from "In Progress" / "Not Started" to "Completed"
2. Add the date
3. Note any deviation from the original plan
4. Update "Current Phase" and "Next Up" at the bottom

---

## Status Legend

Completed | In Progress | Not Started | Blocked

---

## Phase 0 - Setup
- Completed - Backend folder initialized (`server`) - 2026-07-14
- Completed - Frontend folder initialized (`client`) - 2026-07-14
- Completed - Configured Neon PostgreSQL database is reachable; 50 foods present and persistence verified with a temporary test account - 2026-10-01
- Completed - Prisma installed + `schema.prisma` written - 2026-07-14
- In Progress - Migration files exist; current database supports auth/onboarding and plateau resolution (verified 2026-10-01), but migration-history consistency has not been audited
- Completed - Seed script written with 50 Indian foods and demo user - 2026-07-14
- Completed - `.env.example` configured with `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `PORT`, `CLIENT_ORIGIN` - 2026-07-14

## Phase 1 - Auth & Onboarding
- Completed - Signup route (`POST /api/auth/signup`) - 2026-07-14
- Completed - Login route (`POST /api/auth/login`) - 2026-07-14
- Completed - JWT auth middleware (`server/middleware/authMiddleware.js`) - 2026-07-14
- Completed - Onboarding form (frontend `/onboarding`) - 2026-07-14
- Completed - Onboarding data saved to user record (`POST /api/onboarding`) - 2026-07-14

## Phase 2 - Dashboard Shell
- Completed - Dashboard layout with cards, chart, meal/split/plateau sections - 2026-07-14
- Completed - Routing between Dashboard, Meal Plan, Training Split, Workout Logger, History, Onboarding - 2026-07-14

## Phase 3 - Meal Plan Optimizer
- Completed - `knapsack.js` algorithm - 2026-07-14
- Completed - knapsack unit tests include typical, empty, invalid cases - 2026-07-14
- Completed - Meal plan generation route/controller saves plans for authenticated user - 2026-07-14
- Completed - `geminiParser.js` exists for free-text constraints - 2026-07-14
- Completed - `geminiExplainer.js` exists for coach-style explanations with fallback - 2026-07-14
- Completed - Meal Plan frontend page - 2026-07-14

## Phase 4 - Training Split Generator
- Completed - `splitGenerator.js` algorithm - 2026-07-14
- Completed - split generator unit tests include typical, clamp/edge, fallback cases - 2026-07-14
- Completed - Training split route/controller saves splits for authenticated user - 2026-07-14
- Completed - Training Split frontend page - 2026-07-14

## Phase 5 - Workout Logger
- Completed - Workout log create/fetch routes - 2026-07-14
- Completed - Workout Logger frontend page - 2026-07-14
- Completed - Progress chart with Recharts - 2026-07-14

## Phase 6 - Plateau Detection
- Completed - `plateauDetector.js` algorithm - 2026-07-14
- Completed - plateau detector unit tests include stagnant, too-few-sessions, progressing cases - 2026-07-14
- Completed - Trigger on new workout log entry - 2026-07-14
- Completed - Plateau suggestion via Gemini after algorithmic detection - 2026-07-14
- Completed - Plateau alert frontend component and resolve action - 2026-07-14

## Phase 7 - Dashboard Real Data Wiring
- In Progress - Dashboard cards request saved meal plans, splits, workout logs, and plateau flags - 2026-07-14
- Not Started - Empty states and data aggregation need final polish; charts can display sample progress and dashboard labels do not filter plans to today/this week

## Phase 8 - History & Analytics
- In Progress - History page lists meal plans, splits, and plateau flags - 2026-07-14
- Not Started - Macro adherence chart over time

## Phase 9 - Deployment
- Not Started - Backend deployed
- Not Started - Frontend deployed
- Not Started - Production env vars confirmed
- Not Started - CORS configured for production URL

## Phase 10 - Polish / Stretch
- Completed - Dark/light mode toggle added to login/signup and dashboard shell; theme persists in `localStorage` - 2026-07-15
- Not Started - PDF export
- Not Started - Weekly Gemini summary
- Not Started - Body weight tracking

---

## Known Issues / Deviations From Plan

- 2026-07-14: Repository keeps the existing `server/`, `client/`, and root `prisma/` layout instead of moving Prisma under `backend/prisma`. This avoids unnecessary churn while preserving the architecture boundary.
- 2026-07-14: Existing dependency is `bcryptjs`, used as the bcrypt-compatible password hashing implementation. Passwords are still salted with 10 rounds and never stored in plain text.
- 2026-07-14: Backend tests currently use Node's built-in test runner instead of Jest/Vitest. This keeps the existing working test setup and still provides deterministic unit tests for the academic algorithms.
- 2026-07-14: Neon project creation, migration execution, and deployment require external accounts/credentials and must be confirmed by Saksham.
- 2026-07-14: `npm install`, `npm run prisma:generate`, `npm test`, and `npm run build --workspace client` completed successfully. `npm run prisma:migrate -- --skip-seed` reached PostgreSQL on `localhost:5432` but Prisma returned `Schema engine error:` with no detailed message, so the new migration still needs to be applied/checked from the local DB setup.
- 2026-07-15: Dark/light theme uses CSS variables on `:root[data-theme]` plus a React `useTheme` hook. `npm run build` in `client` completed successfully; Vite preview/dev server was confirmed at `http://127.0.0.1:5174/`.
- 2026-10-01: The historical database blocker is superseded by successful live PostgreSQL reads and writes. Migration history itself was not checked or changed. The backend can fall back to an in-memory store when PostgreSQL is unavailable, so successful HTTP responses alone do not prove durable persistence.

## Feature Verification - 2026-10-01

- `npm test`: all 9 existing algorithm tests passed. `npm run build --workspace client`: passed, with bundle-size and ignored React Router directive warnings.
- Verified the running API at `http://localhost:4000/api`. Signup/login, onboarding, meal-plan and training-split creation, five workout entries, automatic plateau detection, and plateau resolution passed. Direct Prisma queries confirmed PostgreSQL persistence. The temporary test user and its related records were deleted after verification.
- Gemini integration exists for constraint parsing, plan explanations, and plateau suggestions. Live requests returned fallback text and empty parsed constraints; a successful live Gemini response was not verified. The provider/configuration failure cause remains undiagnosed.
- Confirmed a meal-selection defect: a non-persisted request with vegetarian/exclusion constraints still selected chicken. `mealController.js` passes constraints to the explainer but does not apply them to food selection. Saved onboarding preferences are not incorporated into plan generation.
- Implemented algorithms are knapsack-style dynamic programming for meal selection, greedy scheduling for training splits, and sliding-window plateau detection. Knapsack is not used for workout scheduling or plateau detection. Passing the existing tests does not establish optimality for all meal inputs.
- Generated meal plans and history exist; actual consumed-meal logging and macro-adherence analytics are not implemented. Workout entries accept custom exercise names and store weight, reps, sets, and dates.
- Frontend state uses React hooks and local storage, but pages and hooks remain together in `client/src/App.jsx`; it is not a separately modularized state layer. Charts can show sample data. Browser interactions were not exercised in this audit.
- This was a verification task; application code and database schema were not changed.

---

## Current Phase

Phase 7 - Dashboard Real Data Wiring (API persistence verified against PostgreSQL; dashboard correctness, empty states, and browser verification pending)

## Next Up

Diagnose Gemini fallback responses, enforce diet/exclusion constraints during meal selection, and connect relevant saved preferences to generation. Finish dashboard date filtering and honest empty states, then verify the browser flows. Audit migration history before future schema changes. Actual meal logging and macro-adherence analytics remain unimplemented.

## Last Updated

2026-10-01
