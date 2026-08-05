import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authSocket = (io: Server) => {

  io.use(async (socket, next) => {

    try {

      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;

      if (!decoded.id) {
        return next(new Error("Invalid token"));
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = user;

      next();

    } catch (error) {

      next(new Error("Invalid or expired token"));

    }

  });

};