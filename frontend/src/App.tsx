import { useEffect, useState } from "react";
import { api, type Itinerary, type SavedTrip, type TripInput, type TripListItem } from "./api";
import ItineraryView from "./ItineraryView";
import TripForm from "./TripForm";

export default function App() {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [input, setInput] = useState<TripInput | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"plan" | "saved">("plan");

  useEffect(() => { void refreshTrips(); }, []);

  async function refreshTrips() {
    try { setTrips(await api.list()); } catch { /* The main actions surface API failures. */ }
  }

  async function generate(nextInput: TripInput) {
    setInput(nextInput); setLoading(true); setError(null); setSaved(false); setSelectedTrip(null);
    try { setItinerary(await api.generate(nextInput)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not generate the itinerary."); setItinerary(null); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!input || !itinerary) return;
    setSaving(true); setError(null);
    try { await api.save(input, itinerary); setSaved(true); await refreshTrips(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the trip."); }
    finally { setSaving(false); }
  }

  async function openTrip(id: string) {
    setLoading(true); setError(null);
    try { setSelectedTrip(await api.get(id)); setView("saved"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not open the trip."); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-shell">
      <header>
        <button className="brand" onClick={() => setView("plan")}><span className="brand-mark">R</span><span>roamday</span></button>
        <nav><button className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}>Plan a trip</button><button className={view === "saved" ? "active" : ""} onClick={() => setView("saved")}>Saved trips <span className="badge">{trips.length}</span></button></nav>
      </header>

      {view === "plan" ? <main>
        <section className="hero"><span className="eyebrow">Work from anywhere</span><h1>Your next workation,<br /><em>planned in seconds.</em></h1><p>Tell us where you're headed. We'll balance focused workdays with the best of the destination.</p></section>
        <div className="planner-card"><TripForm loading={loading} onSubmit={generate} /></div>
        {error && <div className="error-banner"><span>{error}</span>{input && <button onClick={() => void generate(input)}>Try again</button>}</div>}
        {itinerary && <ItineraryView itinerary={itinerary} onSave={() => void save()} saving={saving} saved={saved} />}
      </main> : <main className="saved-page">
        <section className="saved-header"><span className="eyebrow">Your collection</span><h1>Saved trips</h1><p>Reopen any itinerary whenever you're ready to roam.</p></section>
        {error && <div className="error-banner"><span>{error}</span></div>}
        <div className="saved-layout">
          <aside className="trip-list">
            {trips.length === 0 ? <div className="empty-state"><span>✦</span><h3>No saved trips yet</h3><p>Generate an itinerary and save it to see it here.</p><button onClick={() => setView("plan")}>Plan your first trip</button></div> : trips.map((trip) => <button key={trip.id} className={selectedTrip?.id === trip.id ? "trip-row selected" : "trip-row"} onClick={() => void openTrip(trip.id)}><strong>{trip.title}</strong><span>{trip.destination} · {trip.days} days</span><small>{new Date(trip.createdAt).toLocaleDateString()}</small></button>)}
          </aside>
          <div className="saved-detail">{loading ? <div className="loading-state"><span className="spinner dark" />Loading trip…</div> : selectedTrip ? <ItineraryView itinerary={selectedTrip.itinerary} /> : trips.length > 0 ? <div className="empty-state compact"><span>←</span><h3>Select a trip</h3><p>Choose a saved itinerary to view its details.</p></div> : null}</div>
        </div>
      </main>}
      <footer><span>Built for people who work wherever Wi-Fi takes them.</span><span>Roamday · AI Travel Planner</span></footer>
    </div>
  );
}
