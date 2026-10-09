import { Route, ArrowRight, ShieldAlert, GitCommit } from "lucide-react";

export default function RouteCard({ route: r, locations }) {
  const name = (id) => locations.find((p) => p.id === id)?.name || id;
  const isDetour = r.road_ids && r.road_ids.includes("R6");

  return (
    <article className="route-card">
      <div className="section-heading">
        <h3>
          <Route size={18} />
          {r.shelter_id ? `${r.shelter_id}: ` : ""}{r.name}
        </h3>
        <span className={`badge ${isDetour ? "medium" : "safe"}`}>
          {isDetour ? "Detour Route (Bypass)" : "Primary Route"}
        </span>
      </div>

      {/* Step by step path */}
      <div className="route-path">
        {r.path.map((p, i) => (
          <span key={p} className="route-stop">
            {i > 0 && <ArrowRight size={14} className="route-arrow" />}
            <strong>{name(p)}</strong>
          </span>
        ))}
      </div>

      {/* Road sequence badge */}
      {r.road_ids && r.road_ids.length > 0 && (
        <div className="route-roads-strip">
          <small>ROADS TRAVERSED:</small>
          <div className="road-pills">
            {r.road_ids.map((roadId, idx) => (
              <span key={roadId} className="road-pill">
                {idx > 0 && <span className="road-pill-sep">→</span>}
                <strong>{roadId}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {isDetour && (
        <div className="detour-notice">
          ⚠️ <strong>Detour in effect:</strong> Standard direct road R4 is closed. Route diverts through R5 and connector R6.
        </div>
      )}

      <div className="route-meta">
        <span>
          <strong>{r.distance} km</strong> total distance
        </span>
        <span>
          <strong>{r.cost}</strong> weighted cost
        </span>
        <span>
          <strong>{r.people}</strong> people
        </span>
      </div>
    </article>
  );
}
