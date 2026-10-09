import { defineConfig } from "@playwright/test";
import { mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
const dataDir = resolve(".test-data");
mkdirSync(dataDir, { recursive: true });
for (const name of ["shelters", "roads", "disasters", "locations"])
  copyFileSync(
    resolve("../backend/data/" + name + ".json"),
    resolve(dataDir, name + ".json"),
  );
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    channel: "msedge",
    headless: true,
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: [
    {
      command:
        "..\\.venv\\Scripts\\python.exe -m uvicorn backend.app:app --app-dir .. --host 127.0.0.1 --port 8001",
      url: "http://127.0.0.1:8001/api/dashboard",
      env: { SHELTER_DATA_DIR: dataDir },
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5174 --strictPort",
      url: "http://127.0.0.1:5174",
      env: { API_TARGET: "http://127.0.0.1:8001" },
      reuseExistingServer: false,
    },
  ],
});
