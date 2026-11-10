import pg from "pg";
import type { Itinerary, TripInput } from "./schemas.js";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const pool = new Pool({ connectionString: databaseUrl });

export interface TripListItem {
  id: string;
  title: string;
  destination: string;
  days: number;
  createdAt: string;
}

export interface SavedTrip extends TripInput {
  id: string;
  itinerary: Itinerary;
  createdAt: string;
}

interface TripRow {
  id: string;
  destination: string;
  days: number;
  budget_eur: string;
  preferences: TripInput["preferences"] & { notes?: string };
  itinerary: Itinerary;
  created_at: Date;
}

function toSavedTrip(row: TripRow): SavedTrip {
  const { notes, ...preferences } = row.preferences;
  return {
    id: row.id,
    destination: row.destination,
    days: row.days,
    budgetEur: Number(row.budget_eur),
    preferences,
    notes,
    itinerary: row.itinerary,
    createdAt: row.created_at.toISOString(),
  };
}

export async function saveTrip(input: TripInput, itinerary: Itinerary): Promise<SavedTrip> {
  const preferences = { ...input.preferences, notes: input.notes };
  const result = await pool.query<TripRow>(
    `INSERT INTO trips (destination, days, budget_eur, preferences, itinerary)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.destination, input.days, input.budgetEur, preferences, itinerary],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Trip insert returned no row.");
  return toSavedTrip(row);
}

export async function listTrips(): Promise<TripListItem[]> {
  const result = await pool.query<{
    id: string;
    title: string;
    destination: string;
    days: number;
    created_at: Date;
  }>(
    `SELECT id, itinerary->>'title' AS title, destination, days, created_at
     FROM trips ORDER BY created_at DESC`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    destination: row.destination,
    days: row.days,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function getTrip(id: string): Promise<SavedTrip | null> {
  const result = await pool.query<TripRow>("SELECT * FROM trips WHERE id = $1", [id]);
  const row = result.rows[0];
  return row ? toSavedTrip(row) : null;
}
