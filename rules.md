# Rules.md — Coding Rules & Boundaries

Codex/any AI coding agent must follow these rules strictly when building this project.

---

## 1. AI (Gemini) Boundaries — Non-Negotiable

- Gemini is used ONLY inside `/services` (`geminiParser.js`, `geminiExplainer.js`)
- Gemini must NEVER appear inside `/algorithms` files
- Gemini must NEVER:
  - Select which foods go into a meal plan
  - Decide the training split structure
  - Detect a plateau
- Gemini MAY ONLY:
  - Convert free-text user input into structured JSON constraints
  - Convert algorithm output into natural-language explanations
  - Generate a suggestion **after** a plateau has already been flagged algorithmically
- All Gemini calls happen server-side only. API key lives in `.env`, never sent to frontend, never hardcoded.
- If a Gemini call fails, fall back gracefully — return the raw algorithm output without an explanation rather than blocking the feature.

---

## 2. Algorithm Rules

- Every file in `/algorithms` must be a pure function: same input always produces same output, no DB calls, no API calls, no side effects
- Every algorithm must have a corresponding `.test.js` file with at least 3 test cases (typical case, edge case, empty/invalid input)
- Time complexity must be documented as a comment at the top of each algorithm file
- Do not use an LLM to "double check" or "improve" algorithm output — the algorithm's output is final; Gemini only explains it

---

## 3. Libraries — Use These

- **Backend**: express, @prisma/client, jsonwebtoken, bcrypt, zod, dotenv, cors
- **Frontend**: react, react-router-dom, tailwindcss, axios, recharts, lucide-react (icons)
- **Testing**: jest (or vitest) for algorithm unit tests
- **AI**: @google/generative-ai (official Gemini SDK)

## Libraries — Avoid These

- Do NOT use Mongoose or any MongoDB driver — this project is PostgreSQL only
- Do NOT use Sequelize or raw `pg` queries — use Prisma consistently for all DB access
- Do NOT use CSS frameworks other than Tailwind (no Bootstrap, no Material UI) — keep styling consistent
- Do NOT use session-based auth — JWT only
- Do NOT introduce a second AI provider (OpenAI, Claude API, etc.) — Gemini only, to keep the AI boundary story clean for viva

---

## 4. Error Handling

- All Express routes must be wrapped in try/catch or use a centralized async error handler
- Use one shared `errorHandler.js` middleware for consistent error responses:
  ```json
  { "error": true, "message": "Human readable message", "code": "OPTIONAL_ERROR_CODE" }
  ```
- Validate all request bodies with Zod schemas before touching the database or algorithms
- Never expose raw stack traces or Prisma error internals to the frontend in production
- Log errors server-side with enough context (route, user id if available, timestamp)

---

## 5. Security Basics

- Passwords hashed with bcrypt (min 10 salt rounds), never stored in plain text
- JWT secret in `.env`, never committed
- All authenticated routes must check JWT via `authMiddleware.js`
- Users can only access/modify their own data — always filter Prisma queries by the authenticated `user_id`
- Rate-limit the Gemini-calling routes if possible (basic express-rate-limit is fine) to avoid runaway API costs

---

## 6. Code Style

- Consistent naming: camelCase for JS variables/functions, snake_case for DB columns (Prisma handles the mapping)
- Every controller function should be small and delegate real logic to `/algorithms` or `/services`, not contain business logic inline
- Comment WHY, not WHAT, for anything non-obvious (especially DP/greedy/sliding window logic — viva-readiness matters here)
- No commented-out dead code left in final commits

---

## 7. What NOT To Do

- Do not let Codex build all layers in one giant file — respect the folder separation in `architecture.md`
- Do not skip writing algorithm tests "to save time" — this is the most scrutinized part of the project academically
- Do not silently swap PostgreSQL for MongoDB or any other DB "to make it easier" — ask first
- Do not add extra unrelated features not listed in `project.md` / `phases.md` without confirming first
- Do not deploy with `.env` secrets committed to the repo — always use `.env.example` as the template and add `.env` to `.gitignore`
