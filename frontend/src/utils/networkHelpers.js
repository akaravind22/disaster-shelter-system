// Utility helper to unify location, road, and shelter naming across the app

export function getLocationName(id, locations = []) {
  if (!id) return "";
  const found = locations.find((l) => l.id === id);
  if (found) return found.name;

  const names = {
    ZoneA: "Zone A",
    Junction1: "North Junction",
    Junction2: "East Junction",
    Shelter1: "Government School",
    Shelter2: "Community Hall",
    Shelter3: "College Auditorium",
  };
  return names[id] || id;
}

export function getShelterByLocation(locationId, shelters = []) {
  return shelters.find((s) => s.location === locationId);
}

export function getShelterById(shelterId, shelters = []) {
  return shelters.find((s) => s.id === shelterId);
}

export function getRoadDisplay(road, locations = [], shelters = []) {
  const srcName = getLocationName(road.source, locations);
  const dstName = getLocationName(road.destination, locations);

  const srcShelter = getShelterByLocation(road.source, shelters);
  const dstShelter = getShelterByLocation(road.destination, shelters);

  const srcFull = srcShelter ? `${srcName} (${srcShelter.id})` : srcName;
  const dstFull = dstShelter ? `${dstName} (${dstShelter.id})` : dstName;

  let role = "General road corridor";
  if (road.id === "R1") role = "Primary link from Zone A to North Junction";
  else if (road.id === "R2") role = "Direct approach to Government School (S1)";
  else if (road.id === "R3") role = "Primary link from Zone A to East Junction";
  else if (road.id === "R4") role = "Direct approach to Community Hall (S2)";
  else if (road.id === "R5") role = "Direct approach to College Auditorium (S3)";
  else if (road.id === "R6")
    role = "Alternate bypass connector (College Auditorium ↔ Community Hall)";

  return {
    id: road.id,
    sourceId: road.source,
    destId: road.destination,
    sourceName: srcName,
    destName: dstName,
    sourceFull: srcFull,
    destFull: dstFull,
    distance: road.distance,
    risk: road.risk,
    riskLabel: ["", "Low (+0)", "Medium (+3)", "High (+10)"][road.risk] || `Risk ${road.risk}`,
    blocked: road.blocked,
    role,
    summary: `${road.id}: ${srcFull} ⟷ ${dstFull}`,
  };
}

export function getMidpoint(pt1, pt2) {
  if (!pt1 || !pt2) return null;
  return [(pt1[0] + pt2[0]) / 2, (pt1[1] + pt2[1]) / 2];
}
