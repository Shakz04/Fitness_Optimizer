# Phases.md — Build Order

Build strictly in this order. Do not start a phase until the previous one is confirmed working.

---

## Phase 0 — Setup
- Initialize backend (Express) and frontend (React + Tailwind) as separate folders
- Set up Neon PostgreSQL project, get `DATABASE_URL`
- Set up Prisma, write `schema.prisma` per `architecture.md`
- Run first migration, confirm tables exist in Neon
- Write and run the seed script (40-50 Indian foods with macros)
- Set up `.env` / `.env.example` with: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`

**Confirm before moving on:** tables visible in Neon dashboard, seed data present.

---

## Phase 1 — Auth & Onboarding
- Backend: signup, login routes (JWT + bcrypt), auth middleware
- Frontend: Login page, Signup page, Onboarding form (age, weight, height, activity level, diet preference, training experience)
- Store onboarding data against the user record
- Protect all future routes with auth middleware

**Confirm before moving on:** can sign up, log in, complete onboarding, JWT persists and protects a test route.

---

## Phase 2 — Dashboard (Main Page Shell)
- Build the Dashboard page layout (empty states initially): stat cards, meal plan card, split card, progress chart card, plateau alert card
- Wire up navigation between Dashboard, Meal Plan, Training Split, Workout Logger, History pages
- No real data yet — this phase is about layout and routing working end to end

**Confirm before moving on:** all pages reachable, layout matches `design.md` direction, no broken routes.

---

## Phase 3 — Meal Plan Optimizer
- Backend: `/algorithms/knapsack.js` + unit tests
- Backend: meal plan generation route + controller, saves to `meal_plans` / `meal_plan_items`
- Backend: `/services/geminiParser.js` (free text → constraints) and `/services/geminiExplainer.js` (plan → explanation)
- Frontend: Meal Plan page — input form (budget, macros, exclusions, free-text box), results table, regenerate button

**Confirm before moving on:** can generate a real meal plan end to end, algorithm tests pass, Gemini explanation displays.

---

## Phase 4 — Training Split Generator
- Backend: `/algorithms/splitGenerator.js` + unit tests
- Backend: training split route + controller, saves to `training_splits` / `training_split_days`
- Frontend: Training Split page — input form (days/week, goal, equipment), calendar-style output, regenerate button

**Confirm before moving on:** split respects recovery constraints, tests pass, displays correctly on frontend.

---

## Phase 5 — Workout Logger & Progress Charts
- Backend: workout log routes (create, fetch by exercise)
- Frontend: Workout Logger page — log entry form, history table, Recharts progress chart per exercise

**Confirm before moving on:** logs save correctly, chart renders real logged data.

---

## Phase 6 — Plateau Detection
- Backend: `/algorithms/plateauDetector.js` (sliding window) + unit tests
- Trigger detection after each new workout log entry
- On flag, call `/services/geminiExplainer.js` for a suggestion, save to `plateau_flags`
- Frontend: Plateau alert component on Dashboard, resolve/dismiss action

**Confirm before moving on:** plateau correctly flags a manually-inserted stagnant test dataset, suggestion displays.

---

## Phase 7 — Dashboard Wiring (Real Data)
- Connect Dashboard cards to real data: today's meal plan, this week's split, latest progress chart, active plateau alerts
- Polish empty states (new user with no data yet)

---

## Phase 8 — History & Analytics
- Frontend: History page — past meal plans list, past training splits list, macro adherence over time chart

---

## Phase 9 — Deployment
- Deploy backend (Render/Railway), frontend (Vercel/Netlify)
- Confirm Neon connection works in production
- Final environment variable check, CORS configuration between deployed frontend/backend

---

## Phase 10 — Polish & Stretch (only if time permits)
- PDF export of meal plan / split
- Weekly Gemini-generated summary
- Body weight tracking alongside lifts

---

**Reminder:** Update `memory.md` after completing each phase or file, so progress is tracked accurately across sessions.
