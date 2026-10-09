import ShelterCard from "../components/ShelterCard";
import { Link } from "react-router-dom";
export default function Shelters({ data }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLACES OF SAFETY</div>
          <h1>Shelter directory</h1>
          <p>
            Live capacity and reachability for the current disaster location.
          </p>
        </div>
        <Link className="button primary" to="/simulation">
          Manage conditions
        </Link>
      </div>
      <div className="shelter-grid">
        {data.shelters.map((s) => (
          <ShelterCard key={s.id} shelter={s} />
        ))}
      </div>
      <div className="info-note">
        Available capacity is maximum capacity minus existing occupancy. Planned
        evacuees are displayed separately in the evacuation plan.
      </div>
    </>
  );
}
