import { Waypoints, House, Route, BrainCircuit } from "lucide-react";
export default function About() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TRANSPARENT BY DESIGN</div>
          <h1>The intelligence behind the plan</h1>
          <p>
            Four understandable AI techniques. One coordinated evacuation
            workflow.
          </p>
        </div>
      </div>
      <div className="about-grid">
        {[
          [
            Waypoints,
            "01",
            "Breadth-first search",
            "BFS visits the road network in increasing hop count, ignoring blocked roads. It discovers which shelters are reachable from the disaster location; it does not calculate shortest travel distance.",
          ],
          [
            House,
            "02",
            "Constraint satisfaction",
            "Each eligible shelter has an integer allocation variable bounded by its available capacity. Forward checking assigns people while respecting safety, reachability, and a total-allocation constraint. Contiguous domains allow a solution without backtracking.",
          ],
          [
            Route,
            "03",
            "A* route planning",
            "A* minimizes distance plus road risk penalties: 0 for low, 3 for medium, and 10 for high risk. A scaled straight-line heuristic provides a lower bound on the remaining cost. Blocked roads are excluded.",
          ],
          [
            BrainCircuit,
            "04",
            "Rule-based knowledge agent",
            "IF–THEN rules translate risk, blocked roads, full or unsafe shelters, and capacity shortages into clear alerts. Every simulation change runs the analysis again.",
          ],
        ].map(([Icon, n, title, text]) => (
          <section className="card" key={n}>
            <div className="section-heading">
              <span className="tile-icon">
                <Icon />
              </span>
              <span className="step-number">{n}</span>
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <section className="card spaced">
        <h2>Built for a college demonstration</h2>
        <p>
          React + Vite · FastAPI + Python · JSON storage · Leaflet +
          OpenStreetMap
        </p>
        <p>
          This system is developed as an academic software simulation and should
          not be used as a real-world disaster-response system without
          validation, certified data sources, and emergency-authority
          integration.
        </p>
        <p>
          The sample coordinates are near Mangaluru, India. Roads, capacities,
          and risk values are fictional. Map tiles require an internet
          connection; the algorithms and JSON data run locally.
        </p>
      </section>
    </>
  );
}
