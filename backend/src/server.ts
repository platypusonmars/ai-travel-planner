import express, { type NextFunction, type Request, type Response } from "express";
import OpenAI from "openai";
import { ZodError, z } from "zod";
import { getTrip, listTrips, pool, saveTrip } from "./db.js";
import { AiResponseError, generateItinerary } from "./openai.js";
import { saveTripSchema, tripInputSchema } from "./schemas.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const uuidSchema = z.string().uuid();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/itineraries/generate", async (request, response, next) => {
  try {
    const input = tripInputSchema.parse(request.body);
    response.json(await generateItinerary(input));
  } catch (error) {
    next(error);
  }
});

app.post("/api/trips", async (request, response, next) => {
  try {
    const { itinerary, ...input } = saveTripSchema.parse(request.body);
    response.status(201).json(await saveTrip(input, itinerary));
  } catch (error) {
    next(error);
  }
});

app.get("/api/trips", async (_request, response, next) => {
  try {
    response.json(await listTrips());
  } catch (error) {
    next(error);
  }
});

app.get("/api/trips/:id", async (request, response, next) => {
  try {
    const id = uuidSchema.parse(request.params.id);
    const trip = await getTrip(id);
    if (!trip) {
      response.status(404).json({ error: "Trip not found." });
      return;
    }
    response.json(trip);
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found." });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: "Invalid request.", details: error.issues });
    return;
  }
  if (error instanceof AiResponseError) {
    response.status(502).json({ error: "The AI returned an invalid itinerary. Please try again." });
    return;
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    response.status(504).json({ error: "The itinerary request timed out. Please try again." });
    return;
  }
  if (error instanceof OpenAI.APIError) {
    console.error("OpenAI request failed", { status: error.status, name: error.name });
    response.status(502).json({ error: "The AI service could not generate an itinerary. Please try again." });
    return;
  }
  console.error("Unexpected server error", error instanceof Error ? error.message : "Unknown error");
  response.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
