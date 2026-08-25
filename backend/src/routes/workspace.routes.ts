import { Router } from "express";
import { create, deleteworkspace, getMembers, Invite, removeMemberController, updateMemberRoleController, getPendingInvitationsController, acceptInvitationController, rejectInvitationController, cancelInvitationController, getReceivedInvitationsController } from "../controllers/workspace.controller.js";
import { getAllWorkspaces,update } from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { updateWorkspaceSchema} from "../validations/workspace.schema.js";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware,getAllWorkspaces);
router.patch("/:workspaceId", authMiddleware, update);
router.delete("/:workspaceId",authMiddleware, deleteworkspace);
router.post("/:workspaceId/members", authMiddleware, Invite);
router.get("/:workspaceId/members",authMiddleware,getMembers);
router.delete("/:workspaceId/members/:memberId",authMiddleware,removeMemberController);
router.patch("/:workspaceId/members/:memberId",authMiddleware, updateMemberRoleController);
router.get("/:workspaceId/invitations", authMiddleware, getPendingInvitationsController);
router.post("/invitations/:invitationId/accept", authMiddleware, acceptInvitationController);
router.post("/invitations/:invitationId/reject", authMiddleware, rejectInvitationController);
router.post("/invitations/:invitationId/cancel", authMiddleware, cancelInvitationController);
router.get("/invitations/received", authMiddleware, getReceivedInvitationsController);

export default router;