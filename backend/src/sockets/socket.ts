import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import { authSocket } from "./auth.socket.js";
import { registerChannelHandlers } from "./channel.socket..js";
import { registerMessageHandlers } from "./message.socket.js";
import { registerTypingHandlers } from "./typing.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";

let io: Server;

export const initializeSocket = (server: HttpServer) => {

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication Middleware
  authSocket(io);

  io.on("connection", (socket) => {

    console.log(`${socket.data.user.name} connected`);

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