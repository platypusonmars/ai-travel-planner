import type { Itinerary } from "./api";

interface ItineraryViewProps {
  itinerary: Itinerary;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
}

export default function ItineraryView({ itinerary, onSave, saving, saved }: ItineraryViewProps) {
  return (
    <section className="itinerary">
      <div className="itinerary-heading">
        <div><span className="eyebrow">Your itinerary</span><h2>{itinerary.title}</h2><p>{itinerary.summary}</p></div>
        <div className="cost"><span>Estimated total</span><strong>€{Math.round(itinerary.estimatedTotalCostEur).toLocaleString()}</strong></div>
      </div>
      {onSave && <button className="save-button" onClick={onSave} disabled={saving || saved}>{saved ? "✓ Trip saved" : saving ? "Saving…" : "Save trip"}</button>}
      <div className="timeline">
        {itinerary.days.map((day) => (
          <article className="day-card" key={day.day}>
            <div className="day-number"><span>Day</span><strong>{day.day}</strong></div>
            <div className="day-content">
              <h3>{day.city}</h3>
              <div className="work-setup"><span aria-hidden="true">◉</span><div><strong>Work setup</strong><p>{day.workSetup}</p></div></div>
              <div className="day-columns">
                <div><h4>After work</h4><ul>{day.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul></div>
                <div><h4>Useful tips</h4><ul>{day.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
