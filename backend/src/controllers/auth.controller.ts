import type { Request, Response } from "express";
import { registerSchema } from "../validations/auth.validation.js";
import { registerUser } from "../services/auth.service.js";
import { loginSchema } from "../validations/auth.validation.js";
import { loginUser, googleLoginUser } from "../services/auth.service.js";

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



export const login = async (req: Request, res: Response) => {
  try {
   

    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    const result = await googleLoginUser(idToken);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Google authentication failed",
    });
  }
};