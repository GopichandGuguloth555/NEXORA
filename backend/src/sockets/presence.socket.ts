import type { Socket } from "socket.io";

export const registerPresenceHandlers = (socket: Socket) => {

  socket.broadcast.emit("user-online", {
    id: socket.data.user.id,
    name: socket.data.user.name,
  });

  socket.on("disconnect", () => {

    socket.broadcast.emit("user-offline", {
      id: socket.data.user.id,
    });

  });

};