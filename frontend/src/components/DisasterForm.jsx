import { useState } from "react";
import { ArrowRight } from "lucide-react";
export default function DisasterForm({ data, onSubmit, busy }) {
  const [form, setForm] = useState({
    type: "Flood",
    location: "ZoneA",
    risk: "HIGH",
    population: 500,
    description: "",
  });
  const [error, setError] = useState("");
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function submit(e) {
    e.preventDefault();
    if (
      !Number.isInteger(Number(form.population)) ||
      Number(form.population) < 1 ||
      Number(form.population) > 1000000
    ) {
      setError("Enter a whole number between 1 and 1,000,000 people.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please describe the disaster scenario.");
      return;
    }
    setError("");
    onSubmit({
      ...form,
      population: Number(form.population),
      description: form.description.trim(),
    });
  }
  return (
    <form className="card disaster-form" onSubmit={submit}>
      <h2>Disaster details</h2>
      <p>
        Define the scenario. We’ll calculate the shelter allocation and routes.
      </p>
      <div className="form-grid">
        <label>
          Disaster type
          <select name="type" value={form.type} onChange={change}>
            {[
              "Flood",
              "Cyclone",
              "Landslide",
              "Earthquake",
              "Fire",
              "Other",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Disaster location
          <select
            name="location"
            value={form.location}
            onChange={change}
            required
          >
            {data.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Risk level
          <select name="risk" value={form.risk} onChange={change}>
            {["LOW", "MEDIUM", "HIGH"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Affected population
          <input
            name="population"
            type="number"
            min="1"
            max="1000000"
            step="1"
            required
            value={form.population}
            onChange={change}
          />
        </label>
        <label className="full-width">
          Description
          <textarea
            name="description"
            required
            maxLength="1000"
            placeholder="Describe the affected area and the situation…"
            rows="4"
            value={form.description}
            onChange={change}
          />
        </label>
      </div>
      {error && (
        <p className="text-danger" role="alert">
          {error}
        </p>
      )}
      <button className="button primary" disabled={busy}>
        Start evacuation analysis <ArrowRight size={17} />
      </button>
    </form>
  );
}
