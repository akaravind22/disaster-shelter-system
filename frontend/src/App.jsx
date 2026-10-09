import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { X, CheckCircle2, TriangleAlert } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NewDisaster from "./pages/NewDisaster";
import Shelters from "./pages/Shelters";
import RoadNetwork from "./pages/RoadNetwork";
import Evacuation from "./pages/Evacuation";
import Simulation from "./pages/Simulation";
import About from "./pages/About";
export default function App() {
  const [data, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(null),
    [open, setOpen] = useState(false);
  const timer = useRef(),
    inFlight = useRef(false);
  const location = useLocation();
  async function act(path, method = "GET", body = null, message = "") {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api" + path, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : Array.isArray(result.detail)
              ? result.detail.map((e) => e.loc.at(-1) + ": " + e.msg).join("; ")
              : "The request could not be completed.",
        );
      setData(result);
      setError("");
      if (message) notify(message);
      return true;
    } catch (e) {
      const msg =
        e.message === "Failed to fetch"
          ? "Cannot reach the backend. Start FastAPI on port 8000 and retry."
          : e.message.includes("JSON")
            ? "Cannot reach the API. Check that FastAPI is running on port 8000."
            : e.message;
      setError(msg);
      notify(msg, true);
      return false;
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }
  function notify(message, failed = false) {
    setToast({ message, failed });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5000);
  }
  useEffect(() => {
    act("/dashboard");
    return () => clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const props = { data, act, busy };
  return (
    <>
      {location.pathname === "/" ? (
        <Landing />
      ) : (
        <div className="app-shell">
          <Sidebar open={open} close={() => setOpen(false)} />
          <div className="workspace">
            <Navbar toggle={() => setOpen(!open)} />
            <main className="main-content">
              {error && (
                <div className="error-banner" role="alert">
                  <TriangleAlert size={18} />
                  <span>{error}</span>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => act("/dashboard")}
                  >
                    Retry
                  </button>
                </div>
              )}
              {busy && <LoadingSpinner />}
              {data ? (
                <Routes>
                  <Route path="/dashboard" element={<Dashboard {...props} />} />
                  <Route path="/new" element={<NewDisaster {...props} />} />
                  <Route path="/shelters" element={<Shelters {...props} />} />
                  <Route path="/roads" element={<RoadNetwork {...props} />} />
                  <Route
                    path="/evacuation"
                    element={<Evacuation {...props} />}
                  />
                  <Route
                    path="/simulation"
                    element={<Simulation {...props} />}
                  />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="*"
                    element={
                      <div className="card">
                        <h1>Page not found</h1>
                        <Link to="/dashboard" className="button">
                          Back to dashboard
                        </Link>
                      </div>
                    }
                  />
                </Routes>
              ) : (
                !busy && !error && <LoadingSpinner />
              )}
            </main>
            <footer className="workspace-footer">
              <span>ShelterIQ · Intelligent evacuation planning</span>
              <span>Academic simulation only</span>
            </footer>
          </div>
        </div>
      )}
      {toast && (
        <div
          className={"toast " + (toast.failed ? "failed" : "")}
          role="status"
        >
          {toast.failed ? (
            <TriangleAlert size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
