import type { Request, Response } from "express";
import { registerSchema } from "../validations/auth.validation.js";
import { registerUser } from "../services/auth.service.js";

export async function register(req: Request, res: Response) 
{
  try 
  {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    return res.status(201).json({

      success: true,
      message: "User registered successfully",
      data: user,

    });

  } catch (error) 
  {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : " Something went wrong ",
    });
  }
}