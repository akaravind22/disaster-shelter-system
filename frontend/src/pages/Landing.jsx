import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowUpRight,
  House,
  Route,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react";
export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <ShieldCheck />
          </span>
          Shelter<span>IQ</span>
        </Link>
        <Link to="/dashboard" className="button">
          Open workspace <ArrowUpRight size={16} />
        </Link>
      </nav>
      <main className="hero">
        <div>
          <span className="eyebrow">
            SMARTER PLANNING. SAFER POSSIBILITIES.
          </span>
          <h1>
            Every person.
            <br />A safer place<span className="heading-dot">.</span>
          </h1>
          <h2>
            Intelligent Disaster Shelter Allocation and Evacuation Management
            System
          </h2>
          <p>
            Smart evacuation planning using search algorithms, constraint
            satisfaction, and intelligent decision-making.
          </p>
          <div className="button-row">
            <Link className="button primary" to="/simulation">
              Start simulation <ArrowUpRight size={18} />
            </Link>
            <Link className="button" to="/dashboard">
              View dashboard
            </Link>
          </div>
          <small className="hero-note">
            <span className="demo-dot" />
            Built for learning. Designed for preparedness.
          </small>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <svg
            viewBox="0 0 500 420"
            aria-label="Illustrated evacuation routes"
            role="img"
          >
            <path
              d="M80 290 L200 290 L200 130 L400 130 M200 290 L380 320"
              fill="none"
              stroke="#fff"
              strokeWidth="24"
            />
            <path
              d="M80 290 L200 290 L200 130 L400 130 M200 290 L380 320"
              fill="none"
              stroke="#6f86f7"
              strokeWidth="5"
              strokeDasharray="9 7"
            />
            <circle cx="80" cy="290" r="24" fill="#ef7777" />
            <circle cx="80" cy="290" r="9" fill="white" />
            <circle cx="400" cy="130" r="24" fill="#39b792" />
            <circle cx="380" cy="320" r="24" fill="#39b792" />
          </svg>
          <div className="floating-card top">
            <ShieldCheck className="text-success" />
            <div>
              <strong>A safer destination</strong>
              <small>3 shelters connected</small>
            </div>
          </div>
          <div className="floating-card bottom">
            <span className="tile-icon">
              <House />
            </span>
            <div>
              <strong>500 people. One clear plan.</strong>
              <small>Intelligent allocation in action</small>
            </div>
          </div>
        </div>
      </main>
      <section className="landing-features">
        {[
          [
            House,
            "Intelligent shelter allocation",
            "Capacity, safety, and reachability — considered together.",
          ],
          [
            Route,
            "Safe route planning",
            "Find paths that balance distance and road risk.",
          ],
          [
            BrainCircuit,
            "Emergency decision agent",
            "Clear decisions from transparent IF–THEN rules.",
          ],
          [
            SlidersHorizontal,
            "Real-time simulation",
            "Change conditions. See your plan adapt.",
          ],
        ].map(([Icon, title, text]) => (
          <article className="card" key={title}>
            <span className="tile-icon">
              <Icon />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <footer>
        Academic software demonstration · Simulated roads and scenarios · Not
        for real emergency response
      </footer>
    </div>
  );
}
