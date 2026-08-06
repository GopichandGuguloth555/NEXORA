import prisma from "../config/prisma.js";
import type { Socket } from "socket.io";

export const registerChannelHandlers = (socket: Socket) => {

  socket.on("join-channel", async (channelId: string) => {

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

   if (!channel) {
    socket.emit("error", {
        message: "Channel not found",
    });
    return;
}

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: channel.workspaceId,
          userId: socket.data.user.id,
        },
      },
    });

   
if (!member) {
    socket.emit("error", {
        message: "You are not a member of this workspace",
    });
    return;
}

    socket.join(channelId);

    console.log(
      `${socket.data.user.name} joined ${channel.name}`
    );

  });

  socket.on("leave-channel", (channelId: string) => {

    socket.leave(channelId);

    console.log(
      `${socket.data.user.name} left ${channelId}`
    );

  });

};