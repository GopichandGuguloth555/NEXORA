import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import type { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { generateAccessToken } from "../utils/jwt.js";

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Email or User already exists!");
  }

  const hashedPassword = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${data.name}'s Workspace`,
        description: "Default workspace created automatically",
        ownerId: user.id,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    return user;
  });

  return {
    id: result.id,
    name: result.name,
    email: result.email,
  };
}

export const loginUser = async (data: LoginInput) => {
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