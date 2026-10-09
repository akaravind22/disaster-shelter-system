import { Link } from "react-router-dom";
import {
  CloudRain,
  TriangleAlert,
  Users,
  House,
  Waypoints,
  ArrowUpRight,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import RiskCard from "../components/RiskCard";
import MapView from "../components/MapView";
import AlertPanel from "../components/AlertPanel";
import AllocationTable from "../components/AllocationTable";
export default function Dashboard({ data, act, busy }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR RESPONSE, COORDINATED</div>
          <h1>
            Operations overview<span className="heading-dot">.</span>
          </h1>
          <p>
            Welcome, Disaster Management Operator. Here’s your current
            evacuation picture.
          </p>
        </div>
        <Link className="button primary" to="/new">
          New disaster <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="stats">
        <RiskCard
          label="Active disaster"
          value={data.disaster.type}
          detail={
            data.locations.find((p) => p.id === data.disaster.location)?.name
          }
          icon={CloudRain}
        />
        <RiskCard
          label="Risk level"
          value={data.disaster.risk}
          detail="Knowledge agent assessment"
          icon={TriangleAlert}
          tone={data.disaster.risk.toLowerCase()}
        />
        <RiskCard
          label="Affected population"
          value={data.disaster.population.toLocaleString()}
          detail="People requiring shelter"
          icon={Users}
        />
        <RiskCard
          label="Available shelters"
          value={data.shelters
            .filter((s) => s.safe && s.available && s.reachable)
            .length.toString()
            .padStart(2, "0")}
          detail={data.available_capacity + " available spaces"}
          icon={House}
          tone="green-stat"
        />
        <RiskCard
          label="Blocked roads"
          value={data.roads
            .filter((r) => r.blocked)
            .length.toString()
            .padStart(2, "0")}
          detail="Across the road network"
          icon={Waypoints}
        />
      </div>
      <div className="dashboard-middle">
        <section className="card map-card">
          <div className="section-heading">
            <div>
              <h2>Evacuation map</h2>
              <p>A connected view of shelters and safe routes</p>
            </div>
            <span className="live-label">
              <span className="demo-dot" />
              Live simulation
            </span>
          </div>
          <MapView data={data} />
        </section>
        <section className="card alert-card">
          <div className="section-heading">
            <h2>Emergency decisions</h2>
            <span className="count">{data.alerts.length}</span>
          </div>
          <p>Rule-based knowledge agent</p>
          <AlertPanel alerts={data.alerts} />
          <div className="agent-note">
            <span className="demo-dot" /> Evaluated with the current plan
          </div>
          <Link to="/simulation" className="text-link">
            Explore a simulation <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Shelter allocation</h2>
              <p>Capacity-aware assignments for your scenario</p>
            </div>
            <Link className="text-link" to="/evacuation">
              View plan <ArrowUpRight size={16} />
            </Link>
          </div>
          <AllocationTable data={data} />
        </section>
        <section className="card plan-card">
          <span className="tile-icon">
            <Waypoints />
          </span>
          <h2>{data.routes.length} evacuation routes ready</h2>
          <p>
            BFS discovers shelters. CSP assigns people. A* finds the lowest
            distance and risk cost.
          </p>
          <button
            className="button primary"
            disabled={busy}
            onClick={() =>
              act("/evacuate", "POST", null, "Evacuation plan recalculated.")
            }
          >
            <RefreshCw size={16} />
            Recalculate plan
          </button>
          <small>Routes use a simulated road network.</small>
        </section>
      </div>
    </>
  );
}
