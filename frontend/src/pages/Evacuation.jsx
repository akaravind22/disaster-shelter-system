import { RefreshCw } from "lucide-react";
import MapView from "../components/MapView";
import AllocationTable from "../components/AllocationTable";
import RouteCard from "../components/RouteCard";
import AlertPanel from "../components/AlertPanel";
import StatusBadge from "../components/StatusBadge";
export default function Evacuation({ data, act, busy }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FROM ANALYSIS TO ACTION</div>
          <h1>Evacuation plan</h1>
          <p>
            {data.disaster.type} ·{" "}
            {data.locations.find((p) => p.id === data.disaster.location)?.name}{" "}
            · {data.disaster.population} affected people ·{" "}
            <StatusBadge value={data.disaster.risk} />
          </p>
        </div>
        <button
          className="button primary"
          disabled={busy}
          onClick={() => act("/evacuate", "POST", null, "Plan recalculated.")}
        >
          <RefreshCw size={16} />
          Recalculate
        </button>
      </div>
      <div className="workflow">
        <span>01 · BFS reachability</span>
        <span>02 · Safety filtering</span>
        <span>03 · CSP allocation</span>
        <span>04 · A* route planning</span>
      </div>
      <section className="card">
        <MapView data={data} large />
      </section>
      <section className="card spaced">
        <h2>Shelter allocation</h2>
        <AllocationTable data={data} />
      </section>
      <div className="route-grid">
        {data.routes.map((r) => (
          <RouteCard key={r.shelter_id} route={r} locations={data.locations} />
        ))}
      </div>
      {!data.routes.length && (
        <div className="card empty">
          No safe evacuation route is currently available. Update road or
          shelter conditions.
        </div>
      )}
      <section className="card spaced">
        <h2>Agent decisions</h2>
        <AlertPanel alerts={data.alerts} />
      </section>
    </>
  );
}
