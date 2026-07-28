import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/hash.js";
import type { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { comparePassword } from "../utils/hash.js";
import { generateAccessToken } from "../utils/jwt.js";

export async function registerUser(data: RegisterInput) 
{
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Eamil or Uuser already Exists!");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export const loginUser = async (data: LoginInput) => 
{

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  };

};

