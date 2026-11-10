import OpenAI from "openai";
import { itinerarySchema, type Itinerary, type TripInput } from "./schemas.js";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;
if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
if (!model) throw new Error("OPENAI_MODEL is required.");

const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 0 });

const itineraryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "estimatedTotalCostEur", "days"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    estimatedTotalCostEur: { type: "number" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "city", "workSetup", "activities", "tips"],
        properties: {
          day: { type: "integer" },
          city: { type: "string" },
          workSetup: { type: "string" },
          activities: { type: "array", items: { type: "string" } },
          tips: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export class AiResponseError extends Error {}

export async function generateItinerary(input: TripInput): Promise<Itinerary> {
  const response = await client.responses.create({
    model,
    // Low effort keeps responses well inside the 30 s timeout.
    reasoning: { effort: "low" },
    instructions: [
      "You are a practical travel planner for remote workers.",
      "Create exactly one itinerary day for each requested trip day.",
      "Keep the estimated total at or below the stated budget where realistically possible.",
      "Make work arrangements and activities concise, specific, and geographically sensible.",
    ].join(" "),
    input: JSON.stringify(input),
    text: {
      format: {
        type: "json_schema",
        name: "travel_itinerary",
        strict: true,
        schema: itineraryJsonSchema,
      },
    },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    throw new AiResponseError("The AI returned invalid JSON.");
  }

  const result = itinerarySchema.safeParse(parsed);
  if (!result.success || result.data.days.length !== input.days) {
    throw new AiResponseError("The AI returned an itinerary in an invalid format.");
  }
  return result.data;
}
