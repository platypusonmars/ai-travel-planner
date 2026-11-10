import { useState, type FormEvent } from "react";
import type { TripInput } from "./api";

interface TripFormProps {
  loading: boolean;
  onSubmit: (input: TripInput) => void;
}

export default function TripForm({ loading, onSubmit }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("7");
  const [budgetEur, setBudgetEur] = useState("1500");
  const [fastWifi, setFastWifi] = useState(true);
  const [coworkingSpaces, setCoworkingSpaces] = useState(false);
  const [timeZoneOverlap, setTimeZoneOverlap] = useState(false);
  const [quietAccommodation, setQuietAccommodation] = useState(true);
  const [homeTimeZone, setHomeTimeZone] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      destination: destination.trim(),
      days: Number(days),
      budgetEur: Number(budgetEur),
      preferences: {
        fastWifi,
        coworkingSpaces,
        timeZoneOverlap,
        quietAccommodation,
        homeTimeZone: timeZoneOverlap ? homeTimeZone.trim() : undefined,
      },
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form className="planner-form" onSubmit={handleSubmit}>
      <div className="field full">
        <label htmlFor="destination">Where do you want to go?</label>
        <input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Lisbon, then Madeira" maxLength={300} required />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="days">Trip length</label>
          <div className="input-suffix"><input id="days" type="number" min="1" max="60" value={days} onChange={(event) => setDays(event.target.value)} required /><span>days</span></div>
        </div>
        <div className="field">
          <label htmlFor="budget">Total budget</label>
          <div className="input-prefix"><span>€</span><input id="budget" type="number" min="1" step="1" value={budgetEur} onChange={(event) => setBudgetEur(event.target.value)} required /></div>
        </div>
      </div>
      <fieldset>
        <legend>Remote-work essentials</legend>
        <div className="checks">
          <label><input type="checkbox" checked={fastWifi} onChange={(event) => setFastWifi(event.target.checked)} /><span>Fast Wi-Fi</span></label>
          <label><input type="checkbox" checked={coworkingSpaces} onChange={(event) => setCoworkingSpaces(event.target.checked)} /><span>Coworking spaces</span></label>
          <label><input type="checkbox" checked={timeZoneOverlap} onChange={(event) => setTimeZoneOverlap(event.target.checked)} /><span>Home time-zone overlap</span></label>
          <label><input type="checkbox" checked={quietAccommodation} onChange={(event) => setQuietAccommodation(event.target.checked)} /><span>Quiet accommodation</span></label>
        </div>
      </fieldset>
      {timeZoneOverlap && <div className="field full"><label htmlFor="timezone">Home time zone</label><input id="timezone" value={homeTimeZone} onChange={(event) => setHomeTimeZone(event.target.value)} placeholder="e.g. Europe/London or UTC-5" maxLength={100} required /></div>}
      <div className="field full">
        <div className="label-row"><label htmlFor="notes">Anything else?</label><span>{notes.length}/500</span></div>
        <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Preferred pace, interests, dietary needs..." maxLength={500} rows={4} />
      </div>
      <button className="primary-button" type="submit" disabled={loading}>{loading ? <><span className="spinner" />Building your itinerary…</> : <>Generate itinerary <span aria-hidden="true">→</span></>}</button>
    </form>
  );
}
