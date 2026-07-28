import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authMiddleware = async (req: Request,res: Response,next: NextFunction) => {

  try {
    
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract JWT token
    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    // Check if token contains user id
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    
    req.user = user;

    // Continue to the next middleware/controller
    return next();
  } catch (error: unknown) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};