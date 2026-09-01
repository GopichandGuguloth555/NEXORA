import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import { authSocket } from "./auth.socket.js";
import { registerChannelHandlers } from "./channel.socket..js";
import { registerMessageHandlers } from "./message.socket.js";
import { registerTypingHandlers } from "./typing.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  // Support comma-separated origins in CORS_ORIGIN, same as Express CORS config
  const rawOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "https://nexora-2boh7vgtt-gopichand-guguloths-projects.vercel.app",
        // Current production Vercel URL
        "https://nexora-nine-ashy.vercel.app",
      ];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (rawOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Socket CORS: origin ${origin} not allowed`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  authSocket(io);

  io.on("connection", (socket) => {

    console.log(`${socket.data.user.name} connected`);
    
    // Join a personal room to receive targeted notifications
    socket.join(socket.data.user.id);

    registerChannelHandlers(socket);

    registerMessageHandlers(socket);

    registerTypingHandlers(socket);

    registerPresenceHandlers(socket);

    socket.on("disconnect", () => {
      console.log(`${socket.data.user.name} disconnected`);
    });

  });

};

export const getIO = () => io;