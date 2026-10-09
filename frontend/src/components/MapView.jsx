import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  Tooltip,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  getLocationName,
  getRoadDisplay,
  getMidpoint,
} from "../utils/networkHelpers";
import { Info, AlertTriangle, ShieldCheck, Route as RouteIcon } from "lucide-react";

function FitNetwork({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations && locations.length > 0) {
      map.fitBounds(
        locations.map((p) => [p.lat, p.lng]),
        { padding: [45, 45] },
      );
    }
  }, [map, locations]);
  return null;
}

// Custom DivIcons for midpoints
function createRoadblockIcon(roadId) {
  return L.divIcon({
    className: "custom-leaflet-icon roadblock-div-icon",
    html: `<div class="map-roadblock-badge" title="Roadblock on ${roadId}">⛔ ${roadId} BLOCKED</div>`,
    iconSize: [110, 26],
    iconAnchor: [55, 13],
  });
}

function createRoadLabelIcon(roadId, distance) {
  return L.divIcon({
    className: "custom-leaflet-icon road-label-div-icon",
    html: `<div class="map-road-badge" title="Road ${roadId}">${roadId} · ${distance}km</div>`,
    iconSize: [68, 20],
    iconAnchor: [34, 10],
  });
}

export default function MapView({ data, large = false }) {
  const [tileError, setTileError] = useState(false);
  const [showNetworkGuide, setShowNetworkGuide] = useState(false);

  const point = (id) => {
    const p = data.locations.find((l) => l.id === id);
    return p ? [p.lat, p.lng] : null;
  };

  const junctions = useMemo(() => {
    return data.locations.filter((l) => l.id.startsWith("Junction"));
  }, [data.locations]);

  // Distinct vibrant colors for evacuation routes so they don't blend together
  const routePalette = {
    S1: "#2563eb", // Vibrant Royal Blue
    S2: "#7c3aed", // Rich Violet / Purple
    S3: "#d97706", // Deep Amber / Ochre
  };

  return (
    <div className={"map-wrap " + (large ? "large" : "")}>
      <MapContainer center={[12.931, 74.866]} zoom={13} scrollWheelZoom={false}>
        <FitNetwork locations={data.locations} />
        <TileLayer
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false),
          }}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Base Road Network */}
        {data.roads.map((r) => {
          const pt1 = point(r.source);
          const pt2 = point(r.destination);
          if (!pt1 || !pt2) return null;
          const mid = getMidpoint(pt1, pt2);
          const roadInfo = getRoadDisplay(r, data.locations, data.shelters);

          return (
            <div key={`road-group-${r.id}`}>
              <Polyline
                positions={[pt1, pt2]}
                pathOptions={{
                  color: r.blocked ? "#dc2626" : "#64748b",
                  weight: r.blocked ? 5 : 4,
                  opacity: r.blocked ? 0.95 : 0.65,
                  dashArray: r.blocked ? "9 9" : undefined,
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  <strong>{roadInfo.summary}</strong>
                  <br />
                  Distance: {r.distance} km · {roadInfo.riskLabel} ·{" "}
                  {r.blocked ? "⛔ BLOCKED" : "✅ OPEN"}
                </Tooltip>
                <Popup>
                  <div className="map-popup-card">
                    <h4>Road {r.id}</h4>
                    <div className="popup-connection">
                      <strong>{roadInfo.sourceFull}</strong> ⟷{" "}
                      <strong>{roadInfo.destFull}</strong>
                    </div>
                    <div className="popup-meta">
                      <span>Distance: <strong>{r.distance} km</strong></span>
                      <span>Penalty: <strong>{roadInfo.riskLabel}</strong></span>
                      <span>
                        Status:{" "}
                        <strong className={r.blocked ? "text-danger" : "text-success"}>
                          {r.blocked ? "⛔ BLOCKED" : "✅ OPEN"}
                        </strong>
                      </span>
                    </div>
                    <p className="popup-role">{roadInfo.role}</p>
                  </div>
                </Popup>
              </Polyline>

              {/* Road Midpoint Badge or Roadblock Indicator */}
              {mid && (
                <Marker
                  position={mid}
                  icon={
                    r.blocked
                      ? createRoadblockIcon(r.id)
                      : createRoadLabelIcon(r.id, r.distance)
                  }
                  interactive={false}
                />
              )}
            </div>
          );
        })}

        {/* 2. Active Evacuation Routes (Drawn over roads) */}
        {data.routes.map((r) => {
          const pathPoints = r.path.map(point).filter(Boolean);
          const color = routePalette[r.shelter_id] || "#2563eb";
          const roadSequence = r.road_ids && r.road_ids.length > 0 ? r.road_ids.join(" → ") : "";

          return (
            <Polyline
              key={`route-${r.shelter_id}`}
              positions={pathPoints}
              pathOptions={{
                color: color,
                weight: 6,
                opacity: 0.9,
              }}
            >
              <Tooltip direction="top" opacity={1}>
                <div className="route-map-tooltip">
                  <strong>🚗 Evacuation Route to {r.name} ({r.shelter_id})</strong>
                  <div>
                    {r.people} people · {r.distance} km · Cost: {r.cost}
                  </div>
                  {roadSequence && (
                    <div className="route-tooltip-roads">
                      Via Roads: <strong>{roadSequence}</strong>
                    </div>
                  )}
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 3. Transit Junctions (Intersections) */}
        {junctions.map((j) => {
          const pt = point(j.id);
          if (!pt) return null;
          const connectedRoads = data.roads.filter(
            (r) => r.source === j.id || r.destination === j.id,
          );

          return (
            <CircleMarker
              key={`junction-${j.id}`}
              center={pt}
              radius={9}
              pathOptions={{
                color: "#1e293b",
                weight: 3,
                fillColor: "#3b82f6",
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="right">
                🧭 {j.name} ({j.id}) · Transit Junction
              </Tooltip>
              <Popup>
                <div className="map-popup-card">
                  <h4>🧭 {j.name}</h4>
                  <p>Intermediate Transit Junction</p>
                  <div>
                    Connected Roads:{" "}
                    <strong>
                      {connectedRoads.map((r) => r.id).join(", ")}
                    </strong>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 4. Shelter Locations */}
        {data.shelters.map((s) => {
          const pt = point(s.location);
          if (!pt) return null;
          const allocation = data.allocations.find((a) => a.shelter_id === s.id);
          const assignedCount = allocation ? allocation.people : 0;

          return (
            <CircleMarker
              key={`shelter-${s.id}`}
              center={pt}
              radius={12}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillOpacity: 1,
                fillColor: !s.safe
                  ? "#dc2626" // Unsafe red
                  : s.available > 0
                    ? "#10b981" // Available green
                    : "#f59e0b", // Full amber
              }}
            >
              <Tooltip permanent={false} direction="top">
                🏠 {s.id}: {s.name} ({s.available} free / {s.capacity})
              </Tooltip>
              <Popup>
                <div className="map-popup-card">
                  <h4>
                    🏠 {s.name} ({s.id})
                  </h4>
                  <div className="popup-meta">
                    <span>
                      Status:{" "}
                      <strong
                        className={
                          !s.safe
                            ? "text-danger"
                            : s.available > 0
                              ? "text-success"
                              : "text-warning"
                        }
                      >
                        {s.status}
                      </strong>
                    </span>
                    <span>
                      Reachability:{" "}
                      <strong className={s.reachable ? "text-success" : "text-danger"}>
                        {s.reachable ? "Reachable" : "Unreachable (Blocked)"}
                      </strong>
                    </span>
                    <span>
                      Available Spaces: <strong>{s.available} / {s.capacity}</strong>
                    </span>
                    <span>
                      Allocated In Plan:{" "}
                      <strong>{assignedCount} evacuees</strong>
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 5. Disaster Epicenter */}
        {point(data.disaster.location) && (
          <CircleMarker
            center={point(data.disaster.location)}
            radius={14}
            pathOptions={{
              color: "#ffffff",
              weight: 4,
              fillColor: "#ef4444",
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="bottom">
              🚨 {getLocationName(data.disaster.location, data.locations)} · {data.disaster.type} Origin
            </Tooltip>
            <Popup>
              <div className="map-popup-card">
                <h4>🚨 Disaster Epicenter: {getLocationName(data.disaster.location, data.locations)}</h4>
                <div className="popup-meta">
                  <span>Type: <strong>{data.disaster.type}</strong></span>
                  <span>Risk Level: <strong>{data.disaster.risk}</strong></span>
                  <span>Affected Population: <strong>{data.disaster.population.toLocaleString()} people</strong></span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {tileError && (
        <div className="map-offline">
          Background map tiles unavailable. Simulated roads and routes remain visible.
        </div>
      )}

      {/* Map Legend */}
      <div className="map-legend">
        <span>
          <i className="red" />
          Disaster Origin
        </span>
        <span>
          <i className="junction-dot" />
          Transit Junction (North / East)
        </span>
        <span>
          <i className="green" />
          Available Shelter
        </span>
        <span>
          <i className="orange" />
          Full Shelter
        </span>
        <span>
          <i className="dark-red" />
          Unsafe Shelter
        </span>
        <span>
          <i className="blue" />
          Evacuation Route
        </span>
        <span>
          <i className="roadblock-dot" />
          ⛔ Roadblock Barrier
        </span>
        <button
          type="button"
          className="legend-guide-btn"
          onClick={() => setShowNetworkGuide(!showNetworkGuide)}
        >
          {showNetworkGuide ? "Hide Network Guide ▲" : "Show Network Guide ▼"}
        </button>
      </div>

      {/* Network Connections Guide Panel */}
      {showNetworkGuide && (
        <div className="map-connections-guide">
          <div className="guide-header">
            <strong>Road Network & Shelter Connections Topology</strong>
            <small>How roads connect the disaster zone to evacuation shelters</small>
          </div>
          <div className="guide-grid">
            {data.roads.map((r) => {
              const info = getRoadDisplay(r, data.locations, data.shelters);
              return (
                <div
                  key={r.id}
                  className={`guide-item ${r.blocked ? "guide-item-blocked" : ""}`}
                >
                  <div className="guide-item-top">
                    <span className="guide-road-id">{r.id}</span>
                    <span className="guide-road-dist">{r.distance} km</span>
                    <span className={`guide-status ${r.blocked ? "blocked" : "open"}`}>
                      {r.blocked ? "⛔ BLOCKED" : "✅ OPEN"}
                    </span>
                  </div>
                  <div className="guide-path">
                    {info.sourceFull} ⟷ {info.destFull}
                  </div>
                  <div className="guide-role">{info.role}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
