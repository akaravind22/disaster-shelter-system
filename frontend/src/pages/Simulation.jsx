import SimulationPanel from "../components/SimulationPanel";
import AlertPanel from "../components/AlertPanel";
import MapView from "../components/MapView";
import AllocationTable from "../components/AllocationTable";
export default function Simulation(props) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EXPLORE WHAT HAPPENS NEXT</div>
          <h1>Emergency simulation</h1>
          <p>
            Change one condition. Watch the allocation and evacuation routes
            adapt.
          </p>
        </div>
        <span className="badge medium">Demo environment</span>
      </div>
      <SimulationPanel {...props} />
      <div className="dashboard-middle">
        <section className="card">
          <h2>Updated evacuation map</h2>
          <MapView data={props.data} />
        </section>
        <section className="card">
          <h2>Agent response</h2>
          <AlertPanel alerts={props.data.alerts} />
        </section>
      </div>
      <section className="card spaced">
        <h2>Current allocation</h2>
        <AllocationTable data={props.data} />
      </section>
    </>
  );
}
