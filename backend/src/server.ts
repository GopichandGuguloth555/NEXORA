import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Attach Socket.IO to HTTP Server
initializeSocket(server);

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});