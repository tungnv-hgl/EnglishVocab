#!/usr/bin/env node

// Windows-friendly development server launcher
import "dotenv/config";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set NODE_ENV for Windows (where environment variable setting doesn't work the same way)
process.env.NODE_ENV = "development";

// Start the server
const server = spawn("npx", ["tsx", "server/index.ts"], {
  stdio: "inherit",
  cwd: __dirname,
  shell: true, // Needed for Windows
});

server.on("error", (err) => {
  console.error("Failed to start development server:", err);
  process.exit(1);
});

server.on("exit", (code) => {
  process.exit(code);
});

// Handle CTRL+C gracefully
process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});
