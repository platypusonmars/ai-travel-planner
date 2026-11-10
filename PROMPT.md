Build the app described below. Start with a short plan (folder structure + key decisions), then implement it. Follow the spec exactly. Ask me before adding any dependency not listed here.

# AI Travel Planner — Spec (v1)

A web app for remote workers. The user describes a trip, the app generates a
day-by-day itinerary with AI, and the user can save trips and view them later.

## User flow

1. User fills in the form:
   - Destination(s) (text, required)
   - Trip length in days (1–60, required)
   - Total budget in EUR (required, > 0)
   - Remote-work needs (checkboxes): fast Wi-Fi, coworking spaces,
     time-zone overlap with a home time zone, quiet accommodation
   - Home time zone (optional, shown when time-zone overlap is checked)
   - Notes (optional, max 500 characters)
2. User clicks "Generate itinerary" → loading state → itinerary appears.
3. User clicks "Save trip" → trip is stored and appears in "Saved trips".
4. "Saved trips" lists saved trips (newest first); clicking one shows it.

No user accounts in v1: saved trips are global for this instance.

## Architecture

- `frontend/`: React + TypeScript (Vite). Talks only to our backend at `/api`.
- `backend/`: Node.js + Express + TypeScript. Owns all AI calls and DB access.
- `db`: PostgreSQL.
- The OpenAI API key exists only in the backend environment. The browser never
  calls OpenAI directly.

## Backend API

- `POST /api/itineraries/generate`
  Body: the form fields. Returns a generated itinerary (not saved).
- `POST /api/trips`
  Body: form fields + generated itinerary. Saves it, returns the saved trip.
- `GET /api/trips` → list (id, title, destination, days, createdAt).
- `GET /api/trips/:id` → full trip.
- `GET /api/health` → `{ "status": "ok" }` plus a DB connectivity check.

## Itinerary format

Use the OpenAI API via the official `openai` SDK. Request structured JSON
output matching this shape, and validate it at runtime before returning it
to the client:

```
{
  "title": string,
  "summary": string,
  "estimatedTotalCostEur": number,
  "days": [
    {
      "day": number,
      "city": string,
      "workSetup": string,      // where to work that day and why
      "activities": string[],
      "tips": string[]
    }
  ]
}
```

If the model returns invalid JSON or the wrong shape, respond with a clear
502 error instead of passing broken data to the UI.

## Data model

Table `trips`: `id` (uuid), `destination`, `days`, `budget_eur`,
`preferences` (jsonb: the form input), `itinerary` (jsonb), `created_at`.
Create it with a plain SQL init script — no ORM in v1.

## Validation and errors

- Validate all request bodies at the API boundary (zod).
- Validate the AI response before using it.
- Timeout on the AI call (30 s). On timeout or provider error, return a clear
  error message the UI can show, with a "Try again" button in the UI.
- Never log or return the API key or raw provider errors to the client.

## Docker

- `docker-compose.yml` with three services: `frontend`, `backend`, `db`.
- Frontend: multi-stage build, served by nginx, which also proxies `/api`
  to the backend. Only nginx is exposed publicly (port 80).
- Postgres data in a named volume; init SQL mounted into
  `/docker-entrypoint-initdb.d`.
- Secrets come from a `.env` file. Commit `.env.example` only; `.env` is
  in `.gitignore`.

## Environment variables

`OPENAI_API_KEY`, `OPENAI_MODEL`, `DATABASE_URL`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `POSTGRES_DB`, `PORT`.

## Code style

- TypeScript strict mode, no `any`.
- Simple, readable code. A few cohesive modules, no speculative abstractions.
- Allowed dependencies: express, pg, zod, openai (official SDK),
  plus standard Vite/React/TypeScript tooling. Ask before adding anything else.
- Use current stable versions.
- Clean, minimal UI that looks good on desktop and mobile. No UI library.

## Out of scope for v1

User accounts, rate limiting, live prices or bookings, payments, tests.

## Done when

- `docker compose up --build` starts everything with only `.env` filled in.
- I can generate, save, list and reopen a trip in the browser.
- README explains local setup in a few steps.
