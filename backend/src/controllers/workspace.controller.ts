import type { Request, Response } from "express";
import { createWorkspaceSchema, inviteSchema, updateMemberRoleSchema, updateWorkspaceSchema } from "../validations/workspace.schema.js";
import { createWorkspace, deleteWorkspace, getWorkspaceMembers, inviteMember, removeMember, updateMemberRole, getPendingInvitations, acceptInvitation, rejectInvitation, cancelInvitation, getReceivedInvitations } from "../services/workspace.service.js";
import { getWorkspaces, updateWorkspace } from "../services/workspace.service.js";

export const create = async (req: Request, res: Response) => {

  try {
    const data = createWorkspaceSchema.parse(req.body);

    const workspace = await createWorkspace(data, req.user!.id);

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });

  }
  catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const getAllWorkspaces = async (req: Request, res: Response) => {
  try {
    const workspaces = await getWorkspaces(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
      data: workspaces,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = updateWorkspaceSchema.parse(req.body);

    const workspace = await updateWorkspace(
      req.params.workspaceId,
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const deleteworkspace = async (req: Request, res: Response) => {
  try {

    const workspace = await deleteWorkspace(
      req.params.workspaceId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
      data: workspace,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });

  }
};

export const Invite = async (req: Request, res: Response) => {
  try {
    const data = inviteSchema.parse(req.body);

    const workspaceId = req.params.workspaceId;

    const invited = await inviteMember(
      workspaceId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Member invited successfully!",
      data: invited,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;

    const members = await getWorkspaceMembers(
      workspaceId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace members fetched successfully",
      data: members,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const removeMemberController = async (req: Request,res: Response) => {
 
  try {

    const workspaceId = req.params.workspaceId;
    const memberId = req.params.memberId;

    const removedMember = await removeMember(
      workspaceId,
      memberId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully!",
      data: removedMember,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const updateMemberRoleController = async (req: Request,res: Response) => {

  try {
    const workspaceId = req.params.workspaceId;
    const memberId = req.params.memberId;

    const data = updateMemberRoleSchema.parse(req.body);

    const updatedMember = await updateMemberRole(
      workspaceId,
      memberId,
      data.role,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const getPendingInvitationsController = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const invitations = await getPendingInvitations(workspaceId, req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Pending invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const acceptInvitationController = async (req: Request, res: Response) => {
  try {
    const invitationId = req.params.invitationId;
    const result = await acceptInvitation(invitationId, req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const rejectInvitationController = async (req: Request, res: Response) => {
  try {
    const invitationId = req.params.invitationId;
    const result = await rejectInvitation(invitationId, req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const cancelInvitationController = async (req: Request, res: Response) => {
  try {
    const invitationId = req.params.invitationId;
    const result = await cancelInvitation(invitationId, req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getReceivedInvitationsController = async (req: Request, res: Response) => {
  try {
    const invitations = await getReceivedInvitations(req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Received invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};