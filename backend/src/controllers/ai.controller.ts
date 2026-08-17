import type { Request, Response } from "express";
import { generatePlanSchema, aiAssistantSchema } from "../validations/ai.schema.js";
import { generateAIProjectPlan, generateAIAssistantReply } from "../services/ai.service.js";

export const generatePlanController = async (req: Request, res: Response) => {
  try {
    const data = generatePlanSchema.parse(req.body);
    const plan = await generateAIProjectPlan(data);

    return res.status(200).json({
      success: true,
      message: "Project plan generated successfully!",
      data: plan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate project plan",
    });
  }
};

export const aiAssistantController = async (req: Request, res: Response) => {
  try {
    const data = aiAssistantSchema.parse(req.body);
    const reply = await generateAIAssistantReply(data);

    return res.status(200).json({
      success: true,
      message: "Assistant response generated",
      data: { reply },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate assistant response",
    });
  }
};
