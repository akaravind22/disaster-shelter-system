import { NavLink, Link } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  House,
  Waypoints,
  Route,
  SlidersHorizontal,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/new", "New disaster", PlusCircle],
  ["/shelters", "Shelters", House],
  ["/roads", "Road network", Waypoints],
  ["/evacuation", "Evacuation plan", Route],
  ["/simulation", "Simulation", SlidersHorizontal],
  ["/about", "About project", BookOpen],
];
export default function Sidebar({ open, close }) {
  return (
    <>
      <div className={"scrim " + (open ? "visible" : "")} onClick={close} />
      <aside className={"sidebar " + (open ? "open" : "")}>
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-icon">
            <ShieldCheck />
          </span>
          Shelter<span>IQ</span>
        </Link>
        <div className="workspace-label">OPERATOR WORKSPACE</div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={close}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="mini-icon">
            <ShieldCheck size={22} />
          </span>
          <strong>Preparedness starts here.</strong>
          <p>Explore a safer evacuation plan, one scenario at a time.</p>
          <Link to="/about" onClick={close}>
            Behind the algorithms <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-footer">
          <span className="avatar">OP</span>
          <div>
            <strong>Disaster Operator</strong>
            <small>Demo administrator</small>
          </div>
          <span className="demo-dot" />
        </div>
      </aside>
    </>
  );
}
