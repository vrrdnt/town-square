import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSessionFile = path.join(__dirname, "..", "data", "sessions.json");
const sessionFile = process.env.SESSION_FILE || defaultSessionFile;

export function loadSessions() {
  try {
    const raw = fs.readFileSync(sessionFile, "utf8");
    const parsed = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not load session file: ${error.message}`);
    }
    return new Map();
  }
}

export function saveSessions(sessions) {
  fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
  fs.writeFileSync(
    sessionFile,
    JSON.stringify(Object.fromEntries(sessions), null, 2)
  );
}
