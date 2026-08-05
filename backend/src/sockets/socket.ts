import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import { authSocket } from "./middleware/auth.socket.js";
import { registerChannelHandlers } from "./handlers/channel.handler.js";
import { registerMessageHandlers } from "./handlers/message.handler.js";

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

    socket.on("disconnect", () => {
      console.log(`${socket.data.user.name} disconnected`);
    });

  });

};

export const getIO = () => io;