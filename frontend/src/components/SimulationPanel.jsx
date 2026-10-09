import { useState } from "react";
import { Waypoints, House, Activity, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { getLocationName, getRoadDisplay } from "../utils/networkHelpers";

export default function SimulationPanel({ data, act, busy }) {
  const [road, setRoad] = useState("R4");
  const [shelter, setShelter] = useState("S1");

  const r = data.roads.find((r) => r.id === road) || data.roads[0];
  const s = data.shelters.find((s) => s.id === shelter) || data.shelters[0];

  const roadDisplay = getRoadDisplay(r, data.locations, data.shelters);
  const shelterAlloc = data.allocations.find((a) => a.shelter_id === s.id);
  const assignedEvacuees = shelterAlloc ? shelterAlloc.people : 0;

  function run(url, message, confirmMessage) {
    if (!confirmMessage || window.confirm(confirmMessage))
      act(url, "PUT", null, message);
  }

  return (
    <>
      <div className="simulation-grid">
        {/* 1. Road Conditions & Roadblocks */}
        <section className="card">
          <div className="card-top-icon">
            <span className="tile-icon">
              <Waypoints />
            </span>
            <div>
              <h2>Road conditions</h2>
              <p>Close a road to explore an alternative route.</p>
            </div>
          </div>

          <label>
            Select road to inspect / simulate
            <select value={road} onChange={(e) => setRoad(e.target.value)}>
              {data.roads.map((rd) => {
                const info = getRoadDisplay(rd, data.locations, data.shelters);
                return (
                  <option key={rd.id} value={rd.id}>
                    {rd.id}: {info.sourceName} ⟷ {info.destName} ({rd.distance} km){" "}
                    {rd.blocked ? "— [BLOCKED ⛔]" : "— [OPEN]"}
                  </option>
                );
              })}
            </select>
          </label>

          {/* Road Connection Details Card */}
          <div className="sim-detail-box">
            <div className="sim-detail-header">
              <span className="sim-road-tag">Road {roadDisplay.id}</span>
              <span
                className={`badge ${roadDisplay.blocked ? "unsafe" : "safe"}`}
              >
                {roadDisplay.blocked ? "⛔ BLOCKED" : "✅ OPEN"}
              </span>
            </div>
            <div className="sim-endpoints">
              <div>
                <small>ENDPOINT A</small>
                <strong>{roadDisplay.sourceFull}</strong>
              </div>
              <div className="sim-arrow">⟷ {roadDisplay.distance} km ⟷</div>
              <div>
                <small>ENDPOINT B</small>
                <strong>{roadDisplay.destFull}</strong>
              </div>
            </div>
            <div className="sim-meta-row">
              <span>
                Risk Penalty: <strong>{roadDisplay.riskLabel}</strong>
              </span>
              <span>
                Role: <strong>{roadDisplay.role}</strong>
              </span>
            </div>
            {roadDisplay.id === "R4" && roadDisplay.blocked && (
              <div className="sim-impact-notice">
                ⚠️ <strong>Detour active:</strong> Evacuees to Community Hall (S2) are rerouted via R5 & R6 (College Auditorium)!
              </div>
            )}
          </div>

          <div className="button-row">
            <button
              className="button danger-button"
              disabled={busy || r.blocked}
              onClick={() =>
                run(
                  "/roads/" + road + "/block",
                  "Road blocked. Plan recalculated.",
                  "Block " + road + " (" + roadDisplay.sourceName + " ⟷ " + roadDisplay.destName + ") and recalculate the evacuation plan?",
                )
              }
            >
              Block road
            </button>
            <button
              className="button"
              disabled={busy || !r.blocked}
              onClick={() =>
                run(
                  "/roads/" + road + "/unblock",
                  "Road reopened. Plan recalculated.",
                )
              }
            >
              Unblock road
            </button>
          </div>
        </section>

        {/* 2. Shelter Availability & Reallocation */}
        <section className="card">
          <div className="card-top-icon">
            <span className="tile-icon">
              <House />
            </span>
            <div>
              <h2>Shelter availability</h2>
              <p>Update capacity or safety and reallocate people.</p>
            </div>
          </div>

          <label>
            Select shelter
            <select
              value={shelter}
              onChange={(e) => setShelter(e.target.value)}
            >
              {data.shelters.map((sh) => (
                <option key={sh.id} value={sh.id}>
                  {sh.id}: {sh.name} ({sh.available} free / {sh.capacity} cap) — [
                  {sh.status}]
                </option>
              ))}
            </select>
          </label>

          {/* Shelter Connection Details Card */}
          <div className="sim-detail-box">
            <div className="sim-detail-header">
              <span className="sim-road-tag">
                {s.id}: {s.name}
              </span>
              <span
                className={`badge ${
                  !s.safe ? "unsafe" : s.available > 0 ? "safe" : "medium"
                }`}
              >
                {s.status}
              </span>
            </div>
            <div className="sim-meta-row">
              <span>
                Map Node: <strong>{getLocationName(s.location, data.locations)} ({s.location})</strong>
              </span>
              <span>
                Reachability:{" "}
                <strong className={s.reachable ? "text-success" : "text-danger"}>
                  {s.reachable ? "Reachable" : "Unreachable (Blocked)"}
                </strong>
              </span>
            </div>
            <div className="sim-endpoints">
              <div>
                <small>CAPACITY</small>
                <strong>{s.capacity} spaces</strong>
              </div>
              <div>
                <small>OCCUPIED</small>
                <strong>{s.occupied} people</strong>
              </div>
              <div>
                <small>AVAILABLE FREE</small>
                <strong>{s.available} spaces</strong>
              </div>
            </div>
            <div className="sim-meta-row">
              <span>
                Evacuees Assigned in Current Plan:{" "}
                <strong className={assignedEvacuees > 0 ? "text-primary" : ""}>
                  {assignedEvacuees} people
                </strong>
              </span>
            </div>
          </div>

          <div className="button-row">
            <button
              className="button"
              disabled={busy || !s.available}
              onClick={() =>
                run(
                  "/shelters/" + shelter + "/full",
                  "Shelter full. People reallocated.",
                  "Mark " + s.name + " (" + s.id + ") full?",
                )
              }
            >
              Make full
            </button>
            <button
              className="button"
              disabled={busy || s.available > 0}
              onClick={() =>
                run(
                  "/shelters/" + shelter + "/available",
                  "Shelter available. Plan recalculated.",
                )
              }
            >
              Make available
            </button>
            <button
              className="button danger-button"
              disabled={busy || !s.safe}
              onClick={() =>
                run(
                  "/shelters/" + shelter + "/unsafe",
                  "Unsafe shelter excluded.",
                  "Mark " + s.name + " (" + s.id + ") unsafe?",
                )
              }
            >
              Mark unsafe
            </button>
            <button
              className="button"
              disabled={busy || s.safe}
              onClick={() =>
                run("/shelters/" + shelter + "/safe", "Shelter marked safe.")
              }
            >
              Mark safe
            </button>
          </div>
        </section>

        {/* 3. Disaster Risk Assessment */}
        <section className="card">
          <div className="card-top-icon">
            <span className="tile-icon">
              <Activity />
            </span>
            <div>
              <h2>Disaster risk</h2>
              <p>
                Current risk: <strong>{data.disaster.risk}</strong>. Observe the
                agent’s decision.
              </p>
            </div>
          </div>

          <div className="sim-detail-box">
            <div className="sim-detail-header">
              <span>Epicenter: <strong>{getLocationName(data.disaster.location, data.locations)}</strong></span>
              <span className={`badge ${data.disaster.risk.toLowerCase()}`}>
                {data.disaster.risk} RISK
              </span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--muted)" }}>
              {data.disaster.description}
            </p>
            <div className="sim-meta-row" style={{ marginTop: "10px" }}>
              <span>Evacuees: <strong>{data.disaster.population.toLocaleString()} people</strong></span>
              <span>A* Path Penalty: <strong>{data.disaster.risk === "HIGH" ? "+10 on high risk roads" : data.disaster.risk === "MEDIUM" ? "+3 on medium risk roads" : "Standard distance"}</strong></span>
            </div>
          </div>

          <div className="button-row">
            <button
              className="button"
              disabled={busy || data.disaster.risk === "HIGH"}
              onClick={() => run("/risk/increase", "Risk increased.")}
            >
              Increase risk
            </button>
            <button
              className="button"
              disabled={busy || data.disaster.risk === "LOW"}
              onClick={() => run("/risk/decrease", "Risk decreased.")}
            >
              Decrease risk
            </button>
          </div>
        </section>
      </div>

      <div className="reset-strip">
        <div>
          <strong>Start with a clean slate</strong>
          <p>
            Restore the original flood scenario, roads, shelters, and disaster
            history.
          </p>
        </div>
        <button
          className="button"
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Reset all simulation data to the preloaded flood scenario?",
              )
            )
              act("/reset", "POST", null, "Simulation reset.");
          }}
        >
          <RotateCcw size={16} />
          Reset simulation
        </button>
      </div>
    </>
  );
}
