import type { Socket } from "socket.io";

export const registerMessageHandlers = (socket: Socket) => {

  socket.on("typing", (channelId: string) => {

    socket.to(channelId).emit("user-typing", {
      userId: socket.data.user.id,
      name: socket.data.user.name,
    });

  });

  socket.on("stop-typing", (channelId: string) => {

    socket.to(channelId).emit("user-stop-typing", {
      userId: socket.data.user.id,
    });

  });

};