import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 5000;

// ---- Startup environment check ----
const required = ["DATABASE_URL", "JWT_SECRET"] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("[Server] FATAL: Missing required environment variables:", missing.join(", "));
  console.error("[Server] Set them on Render under Environment > Environment Variables.");
  process.exit(1);
}
console.log("[Server] Environment check passed.");
console.log(`[Server] CORS_ORIGIN: ${process.env.CORS_ORIGIN ?? "(using hardcoded fallback)"}`);
// -----------------------------------

const server = createServer(app);

// Attach Socket.IO to HTTP Server
initializeSocket(server);

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});