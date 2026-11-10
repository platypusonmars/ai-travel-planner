export interface Preferences {
  fastWifi: boolean;
  coworkingSpaces: boolean;
  timeZoneOverlap: boolean;
  quietAccommodation: boolean;
  homeTimeZone?: string;
}

export interface TripInput {
  destination: string;
  days: number;
  budgetEur: number;
  preferences: Preferences;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  city: string;
  workSetup: string;
  activities: string[];
  tips: string[];
}

export interface Itinerary {
  title: string;
  summary: string;
  estimatedTotalCostEur: number;
  days: ItineraryDay[];
}

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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
      throw new Error(body.error);
    }
    throw new Error("The request failed. Please try again.");
  }
  return response.json() as Promise<T>;
}

export const api = {
  generate: (input: TripInput) => request<Itinerary>("/api/itineraries/generate", {
    method: "POST",
    body: JSON.stringify(input),
  }),
  save: (input: TripInput, itinerary: Itinerary) => request<SavedTrip>("/api/trips", {
    method: "POST",
    body: JSON.stringify({ ...input, itinerary }),
  }),
  list: () => request<TripListItem[]>("/api/trips"),
  get: (id: string) => request<SavedTrip>(`/api/trips/${id}`),
};
