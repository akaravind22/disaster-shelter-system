import { Menu, ShieldCheck } from "lucide-react";
export default function Navbar({ toggle }) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        aria-label="Toggle navigation"
        onClick={toggle}
      >
        <Menu />
      </button>
      <div className="breadcrumb">
        Operations <span>/</span> Evacuation workspace
      </div>
      <div className="operator">
        <span className="demo-dot" /> Academic simulation{" "}
        <span className="avatar">
          <ShieldCheck size={19} />
        </span>
      </div>
    </header>
  );
}
