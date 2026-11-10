CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  days integer NOT NULL CHECK (days BETWEEN 1 AND 60),
  budget_eur numeric NOT NULL CHECK (budget_eur > 0),
  preferences jsonb NOT NULL,
  itinerary jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
