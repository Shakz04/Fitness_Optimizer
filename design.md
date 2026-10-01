# Design.md — Visual Design System

## Overall Direction

Clean, minimal, data-forward. This is a fitness/optimization tool, not a lifestyle app — prioritize clarity and scannability over decoration. Think "calm dashboard," not "flashy gym app."

---

## Color Palette

**Base (light mode default)**
- Background: `#FAFAFA`
- Surface (cards): `#FFFFFF`
- Border: `#E5E5E5`
- Text primary: `#171717`
- Text secondary: `#6B6B6B`

**Accent — Primary (used for CTAs, active states, key numbers)**
- Primary: `#2563EB` (blue) — represents "optimization / logic"
- Primary hover: `#1D4ED8`

**Semantic colors**
- Success / on-track: `#16A34A` (green) — macros hit, goals met
- Warning / plateau alert: `#D97706` (amber) — used specifically for plateau flags, keep this color reserved for that purpose only so it stands out
- Error: `#DC2626` (red) — form errors, failed requests
- Info: `#0891B2` (teal) — optional, for Gemini-generated explanation callouts

**Dark mode (optional, if time permits)**
- Background: `#0F0F0F`
- Surface: `#1A1A1A`
- Border: `#2A2A2A`
- Text primary: `#F5F5F5`
- Text secondary: `#A3A3A3`
- Keep accent colors the same, slightly desaturated if needed for contrast

---

## Typography

- **Font family**: `Inter` (Google Fonts) for all UI text — clean, highly legible, standard for dashboards
- Fallback stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Scale**
| Use | Size | Weight |
|---|---|---|
| Page title | 20-24px | 500 |
| Section header | 15-16px | 500 |
| Body text | 13-14px | 400 |
| Secondary/muted text | 12-13px | 400 |
| Big stat numbers | 24-28px | 500 |
| Button text | 13-14px | 500 |

Avoid bold (700) except for the biggest numbers on the dashboard — keep the overall feel restrained, not shouty.

---

## Layout Principles

- Card-based layout: every major feature (meal plan, split, chart, alert) lives in its own card with consistent padding (`16-20px`) and rounded corners (`8-12px radius`)
- Generous whitespace over dense tables — this is a demo project, legibility in a viva presentation matters more than information density
- Consistent grid: 3-column stat row up top, 2-column feature cards below, full-width tables/charts where needed
- Mobile responsiveness is a nice-to-have, not a priority for v1 — desktop dashboard view is what will be demoed

---

## Component Notes

- **Buttons**: solid primary blue for main actions (Generate, Save), outline/ghost style for secondary actions (Regenerate, Cancel)
- **Plateau alerts**: always amber background, warning icon, never confused visually with error states
- **Charts**: single-color line charts (primary blue), no unnecessary gridlines, minimal axis labels
- **Forms**: labels above inputs, not placeholder-only fields (placeholders disappear and hurt usability during a live demo)
- **Icons**: use a single icon set throughout (lucide-react) — don't mix icon libraries

---

## Tone of AI-Generated Text (Gemini Explanations)

- Coach-like, encouraging, plain language — no robotic phrasing like "Based on the analysis of your data..."
- Short — 2-4 sentences max per explanation, this is a summary not an essay
- Should read like a knowledgeable friend, not a customer support bot
