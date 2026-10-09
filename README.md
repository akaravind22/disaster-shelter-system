# ShelterIQ
## Intelligent Disaster Shelter Allocation and Evacuation Management System

A complete college demonstration using React, FastAPI, BFS, integer constraint satisfaction, A*, and a rule-based knowledge agent. No database, API key, or paid service is required.

## Run locally
Requires Python 3.10+ and Node.js 20.19+.

From this directory, open two terminals.

**Backend (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. Interactive API documentation: **http://127.0.0.1:8000/docs**.
On macOS/Linux, use `.venv/bin/python` instead of the Windows executable path.
Vite forwards `/api` requests to FastAPI. For a local production build, run `npm run build`, then `npm run preview` while the backend runs.

## Demonstration
1. Open the dashboard: Flood, Zone A, HIGH risk, 500 people.
2. The initial plan assigns **200 to Government School (S1)** and **300 to Community Hall (S2)**.
3. Open Simulation; block **R4**. Community Hall's route changes from R3 → R4 to **R3 → R5 → R6**, with distance 9 km and weighted cost 12.
4. Mark **S1 full**. The plan assigns **300 to S2 and 200 to S3**.
5. Mark another shelter unsafe to see a capacity warning, or block R1 and R3 to make all shelters unreachable.
6. Increase/decrease risk to observe the knowledge agent's advice.
7. Reset Simulation restores the original data and clears disaster history.

The five requested sample roads are included unchanged. **R6** is an additional bidirectional connector between Shelter3 and Shelter2, necessary to demonstrate an alternative route after R4 closes.

## Pages
Landing, Dashboard, New Disaster, Shelters, Road Network, Evacuation Plan, Emergency Simulation, and About Project. The dashboard, simulation map, and plan all use the same backend response. Updates refresh after each action; there is no WebSocket or background multi-operator synchronization.

## How the AI works
- **BFS:** queue-based graph traversal finds reachable shelters in increasing hop count; blocked roads are omitted.
- **Filtering:** only safe, reachable shelters with spare capacity are eligible.
- **CSP:** integer variables represent people assigned to each shelter. Domains are 0 through available capacity. A total-allocation constraint equals the lesser of population and eligible capacity. Forward checking bounds each variable by remaining capacity. Since the domains are contiguous and people interchangeable, choosing the greatest feasible value always admits a completion. This special case needs no backtracking and prioritizes shelter input order.
- **A\*:** minimizes distance + risk penalty (low 0, medium 3, high 10). Its heuristic is coordinate distance multiplied by the minimum road-distance/coordinate-distance ratio. This is consistent and admissible for these synthetic distances; missing coordinates fall back to zero.
- **Knowledge agent:** IF–THEN rules evaluate disaster risk, full/unsafe shelters, road closures, shortages, and lack of reachability. Initial rules are evaluated before BFS, and allocation-related rules after planning.

High-risk roads are penalized, not prohibited. This is a weighted-cost route model, not a real-world safety guarantee. Disaster risk changes agent advice; road risk determines A* costs.

## Data and persistence
`backend/data/{shelters,roads,disasters,locations}.json` are the persisted data sources. Coordinates are illustrative points near Mangaluru. Roads and capacities are fictional.
- Planned evacuees do **not** change stored shelter occupancy; repeated calculations cannot double-count people.
- “Make available” restores the occupancy saved before “Make full.”
- JSON writes use a temporary file followed by replacement. A process lock serializes operations; run a **single Uvicorn worker**.
- Missing/invalid JSON yields a readable 503 error. Restore data with `python -m backend.seed` from this directory (this overwrites all demo data).
- `SHELTER_DATA_DIR` can point to a separate data directory for tests.
- OpenStreetMap tiles and optional Google Fonts need internet; system fonts and all planning algorithms work locally. Map geometry is illustrative and does not follow actual streets.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/dashboard | Complete computed plan |
| GET | /api/shelters, /api/roads, /api/disasters, /api/locations | Current data |
| POST | /api/disaster | Validate and save a new scenario; return plan |
| POST | /api/evacuate, /api/allocate | Recompute current scenario |
| POST | /api/find-shelters | Body: {"location":"ZoneA"} |
| POST | /api/find-route | Body: {"location":"ZoneA","destination":"Shelter1"} |
| PUT | /api/roads/{id}/block or /unblock | Change road state |
| PUT | /api/shelters/{id}/full, /available, /safe, /unsafe | Change shelter state |
| PUT | /api/risk/increase or /decrease | Change active disaster risk |
| POST | /api/reset | Restore the original demo |

Example disaster body:
```json
{"type":"Flood","location":"ZoneA","risk":"HIGH","population":500,"description":"Flood exercise"}
```

## Verification
```powershell
.\.venv\Scripts\python.exe -m unittest discover -s backend/tests -v
cd frontend
npm run build
```
Backend tests isolate their JSON files and cover default allocation, alternate routing, shelter reassignment, capacity shortages, unreachable routes, input errors, risk boundaries, and repeated calculations.

## Scope
One local operator/admin role, without login. The architecture intentionally stays small and readable. No live disaster feeds, real occupancy feeds, emergency dispatch, or certified routing are included.

This system is developed as an academic software simulation and should not be used as a real-world disaster-response system without validation, certified data sources, and emergency-authority integration.


### Browser checks
The included Playwright configuration uses installed Microsoft Edge on Windows and starts isolated servers on ports 8001 and 5174. It copies JSON into an ignored test directory, keeping demo data untouched.

```powershell
cd frontend
npx playwright test
```
For another OS, change the backend command in `playwright.config.js` to `.venv/bin/python` (with the correct relative path) and configure an installed browser channel. Screenshots are saved under `frontend/test-results/`.
