import MapView from "../components/MapView";
import { Link } from "react-router-dom";
import { Waypoints, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { getRoadDisplay } from "../utils/networkHelpers";

export default function RoadNetwork({ data, act, busy }) {
  function toggleRoad(r) {
    if (!act) return;
    const url = r.blocked ? `/roads/${r.id}/unblock` : `/roads/${r.id}/block`;
    const msg = r.blocked
      ? `Road ${r.id} reopened. Plan recalculated.`
      : `Road ${r.id} blocked. Plan recalculated.`;
    act(url, "PUT", null, msg);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONNECTED AND REACHABLE</div>
          <h1>Road network</h1>
          <p>Inspect travel distance, risk, road availability, and shelter links.</p>
        </div>
        <Link to="/simulation" className="button primary">
          Simulate road closure
        </Link>
      </div>

      {/* Network Topology Overview Guide */}
      <section className="card" style={{ marginBottom: "22px" }}>
        <div className="section-heading">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="tile-icon" style={{ margin: 0 }}>
              <Waypoints />
            </span>
            <div>
              <h2>Network graph topology</h2>
              <p>How roads connect the disaster epicenter (Zone A) to evacuation shelters</p>
            </div>
          </div>
        </div>

        <div className="topology-grid">
          <div className="topology-card">
            <span className="topo-badge">North Branch (S1 Route)</span>
            <h4>Zone A ➜ North Junction ➜ Government School (S1)</h4>
            <p>
              Consists of <strong>R1 (2 km)</strong> connecting to North Junction, then{" "}
              <strong>R2 (3 km)</strong> connecting to Government School. Total: 5 km.
            </p>
          </div>
          <div className="topology-card">
            <span className="topo-badge">East Branch (S2 Route)</span>
            <h4>Zone A ➜ East Junction ➜ Community Hall (S2)</h4>
            <p>
              Consists of <strong>R3 (3 km)</strong> connecting to East Junction, then{" "}
              <strong>R4 (2 km)</strong> to Community Hall. Total: 5 km.
            </p>
          </div>
          <div className="topology-card highlight-card">
            <span className="topo-badge detour-badge">Alternate Detour (Bypass)</span>
            <h4>Zone A ➜ East Junction ➜ College Auditorium (S3) ➜ Community Hall (S2)</h4>
            <p>
              When <strong>R4 is blocked</strong>, traffic detours via <strong>R5 (4 km)</strong> to
              College Auditorium, then connector <strong>R6 (2 km)</strong> to Community Hall. Total: 9 km.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="card">
        <div className="section-heading">
          <h2>Interactive road & shelter map</h2>
          <span className="badge safe">Live coordinates</span>
        </div>
        <MapView data={data} />
      </section>

      {/* Road Details Table */}
      <section className="card spaced">
        <div className="section-heading">
          <h2>Road directory & conditions</h2>
          <small>Click status buttons to quickly toggle road closure</small>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ROAD ID</th>
                <th>CONNECTION (START ⟷ END)</th>
                <th>CONNECTED SHELTER / ROLE</th>
                <th>DISTANCE</th>
                <th>RISK / PENALTY</th>
                <th>STATUS & CONTROL</th>
              </tr>
            </thead>
            <tbody>
              {data.roads.map((r) => {
                const info = getRoadDisplay(r, data.locations, data.shelters);
                return (
                  <tr key={r.id}>
                    <td>
                      <strong className="road-table-id">{r.id}</strong>
                    </td>
                    <td>
                      <div className="road-conn-name">
                        <strong>{info.sourceName}</strong>
                        <span>⟷</span>
                        <strong>{info.destName}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="road-role-text">{info.role}</span>
                    </td>
                    <td>
                      <strong>{r.distance} km</strong>
                    </td>
                    <td>
                      <span className={`risk-tag risk-${r.risk}`}>{info.riskLabel}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={"badge " + (r.blocked ? "unsafe" : "safe")}>
                          {r.blocked ? "⛔ Blocked" : "✅ Open"}
                        </span>
                        {act && (
                          <button
                            type="button"
                            className={`table-action-btn ${r.blocked ? "btn-unblock" : "btn-block"}`}
                            disabled={busy}
                            onClick={() => toggleRoad(r)}
                            title={r.blocked ? "Reopen this road" : "Block this road"}
                          >
                            {r.blocked ? "Reopen" : "Block"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="info-note">
        All roads are bidirectional. Road R6 is an extra link between College Auditorium (S3) and
        Community Hall (S2) designed specifically to provide an alternative route when R4 is closed.
      </p>
    </>
  );
}
