import { House, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ShelterCard({ shelter: s }) {
  return (
    <article className="card shelter-card">
      <div className="section-heading">
        <span className="tile-icon">
          <House />
        </span>
        <StatusBadge value={s.status} />
      </div>
      <small>{s.id} · EMERGENCY SHELTER</small>
      <h3>{s.name}</h3>
      <p>
        <MapPin size={14} /> Node: <strong>{s.location}</strong> ({s.name}) ·{" "}
        <span className={s.reachable ? "text-success" : "text-danger"}>
          {s.reachable ? "Reachable from Zone A" : "Unreachable (Blocked)"}
        </span>
      </p>
      <div className="capacity-values">
        <strong>
          {s.available}
          <small>spaces available</small>
        </strong>
        <span>
          {s.occupied} / {s.capacity}
          <small>current occupancy</small>
        </span>
      </div>
      <div className="progress">
        <span style={{ width: (s.occupied / s.capacity) * 100 + "%" }} />
      </div>
    </article>
  );
}
