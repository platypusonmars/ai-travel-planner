import { z } from "zod";

export const preferencesSchema = z.object({
  fastWifi: z.boolean(),
  coworkingSpaces: z.boolean(),
  timeZoneOverlap: z.boolean(),
  quietAccommodation: z.boolean(),
  homeTimeZone: z.string().trim().max(100).optional(),
}).superRefine((preferences, context) => {
  if (preferences.timeZoneOverlap && !preferences.homeTimeZone) {
    context.addIssue({
      code: "custom",
      path: ["homeTimeZone"],
      message: "Home time zone is required when time-zone overlap is selected.",
    });
  }
});

export const tripInputSchema = z.object({
  destination: z.string().trim().min(1, "Destination is required.").max(300),
  days: z.number().int().min(1).max(60),
  budgetEur: z.number().positive(),
  preferences: preferencesSchema,
  notes: z.string().trim().max(500).optional(),
});

export const itinerarySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  estimatedTotalCostEur: z.number().nonnegative(),
  days: z.array(z.object({
    day: z.number().int().positive(),
    city: z.string().min(1),
    workSetup: z.string().min(1),
    activities: z.array(z.string()),
    tips: z.array(z.string()),
  })).min(1),
});

export const saveTripSchema = tripInputSchema.extend({
  itinerary: itinerarySchema,
});

export type TripInput = z.infer<typeof tripInputSchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;
