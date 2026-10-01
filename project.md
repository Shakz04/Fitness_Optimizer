# Project.md — Personalized Fitness Macro & Program Optimizer

## What This Project Is

A full-stack fitness web app that generates **optimal, budget-constrained meal plans** and **recovery-aware training splits**, tracks workout logs and calorie/macro intake, detects strength plateaus automatically, and uses AI (Gemini API) strictly as a natural-language layer — never as the decision-making engine.

This is being built as a college Engineering Project (EP) submission. It must be defensible in an academic viva: every core decision (meal selection, training split, plateau detection) must come from a documented algorithm, not from an LLM call. AI is used only to parse messy user input and to explain algorithm output in plain language.

---

## The Problem This Solves

Generic fitness apps give one-size-fits-all meal plans and templated training splits. They don't account for:
- A real budget constraint (₹/day) while still hitting macro targets
- Recovery time between muscle groups when generating a weekly split
- Silently plateaued lifts that the user hasn't noticed themselves

This app solves all three with real algorithms, and uses AI only to make input/output feel human.

---

## Who The User Is

- A student or gym-goer who wants a data-driven, budget-aware meal plan and training split
- Someone tracking workouts over time who wants automatic plateau detection instead of manually reviewing logs
- Comfortable with a simple web dashboard; no mobile app needed for v1

---

## Core Features (User-Facing)

1. **Sign up / login** — JWT-based auth
2. **Onboarding** — age, weight, height, activity level, diet preference (veg/non-veg/eggetarian), training experience
3. **Meal Plan Optimizer** — input daily budget + target macros → get an optimal food combination (0/1 Knapsack DP)
4. **Training Split Generator** — input days/week + goal + equipment → get a recovery-aware weekly split (Greedy/graph-based)
5. **Workout Logger** — log exercise, weight, reps, sets, date; view history and progress charts
6. **Plateau Detection** — sliding window over recent sessions per exercise, auto-flags stagnation
7. **Natural Language Input Parser** — free-text constraints ("I'm vegetarian, hate paneer, train at 6am") parsed into structured JSON by Gemini
8. **AI Explanations** — Gemini explains meal plans, training splits, and plateau flags in a coach-like tone
9. **Dashboard** — central view: today's meal plan, this week's split, recent progress, active plateau alerts
10. **History & Analytics** — past meal plans, past splits, macro adherence over time

---

## Core Algorithms (Must Be Pure, Testable, No AI/DB Inside)

| Feature | Algorithm | Why it's necessary (not decorative) |
|---|---|---|
| Meal Plan Optimizer | 0/1 Knapsack (Dynamic Programming) | Constrained optimization (budget + macros) — LLMs cannot reliably guarantee an optimal combination |
| Training Split Generator | Greedy / graph-based scheduling with recovery constraints | Deterministic constraint satisfaction across muscle group recovery windows |
| Plateau Detection | Sliding Window over last N sessions | Must be exact and reproducible, not probabilistic |

---

## Where AI (Gemini API) Is Allowed

- Parsing free-text user input into structured constraints (JSON)
- Explaining algorithm output in natural, coach-like language
- Generating a suggestion (deload, exercise variation) **after** a plateau has already been detected algorithmically

## Where AI Is NOT Allowed

- Never used to select foods, generate the training split, or detect a plateau
- Never called for anything the algorithms folder is responsible for
- Never given write access to the database directly

---

## Success Criteria for v1

- User can complete onboarding, generate a meal plan and training split, log workouts, and see a plateau flag with an AI-generated suggestion
- All three core algorithms have unit tests with sample input/output
- Clear folder separation between `/algorithms` (pure logic) and `/services` (AI calls)
- Deployed and accessible online (not just localhost) for demo purposes
