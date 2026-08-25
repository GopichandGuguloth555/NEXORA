import prisma from "../config/prisma.js";
import type { InviteInput } from "../validations/workspace.schema.js";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validations/workspace.schema.js";
import { Role } from "../generated/prisma/enums.js";

export const createWorkspace = async (data: CreateWorkspaceInput, userId: string) => {

  const workspace = await prisma.workspace.create({

    data:
    {
      name: data.name,
      description: data.description,

      owner:
      {
        connect:
        {
          id: userId,
        },
      },

      members: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          role: "OWNER",
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      members: true,
    }
  });

  return workspace;
};

export const getWorkspaces = async (userId: string) => {

  const workspaces = await prisma.workspace.findMany({

    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      members: true,
    },
  });

  return workspaces;
};

export const updateWorkspace = async (workspaceId: string,data: UpdateWorkspaceInput,userId: string) => {
  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check membership
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  // Check role
  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // Update workspace
  const updatedWorkspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },

    data: {
      name: data.name,
      description: data.description,
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },

      members: true,
    },
  });

  return updatedWorkspace;
};

export const deleteWorkspace = async (workspaceId: string,userId: string) => {

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  if (member.role !== "OWNER") {
    throw new Error("Forbidden");
  }

  return await prisma.$transaction(async (tx) => {

    await tx.workspaceMember.deleteMany({
      where: {
        workspaceId,
      },
    });

    const deletedWorkspace = await tx.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return deletedWorkspace;
  });
};

export const inviteMember = async (workspaceId: string,data: InviteInput,userId: string) => {
  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check requester permissions
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // Find invited user
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("User does not exist");
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member");
  }

  // Check pending invitations
  const existingInvitation = await prisma.workspaceInvitation.findUnique({
    where: {
      workspaceId_inviteeEmail: { workspaceId, inviteeEmail: data.email },
    },
  });

  if (existingInvitation && existingInvitation.status === "PENDING") {
    throw new Error("Invitation is already pending for this user");
  }

  // Create invitation and notification
  return await prisma.$transaction(async (tx) => {
    let invitation;
    if (existingInvitation) {
      invitation = await tx.workspaceInvitation.update({
        where: { id: existingInvitation.id },
        data: { status: "PENDING", inviterId: userId, role: data.role },
      });
    } else {
      invitation = await tx.workspaceInvitation.create({
        data: {
          workspaceId,
          inviterId: userId,
          inviteeEmail: data.email,
          role: data.role,
          status: "PENDING",
        },
      });
    }

    await tx.notification.create({
      data: {
        type: "WORKSPACE_INVITE",
        title: `Workspace Invitation`,
        message: `You have been invited to join the workspace ${workspace.name}`,
        entityId: invitation.id,
        userId: user.id,
      },
    });

    return invitation;
  });
};

export const getWorkspaceMembers = async (workspaceId: string,userId: string) => 
  {

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

 
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new Error("You are not a member of this workspace");
  }


  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return members;
};

export const removeMember = async (workspaceId: string,memberId: string,userId: string) => {
  
  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check requester is a member
  const requester = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!requester) {
    throw new Error("You are not a member of this workspace");
  }

  // Check requester permissions
  if (requester.role !== "OWNER" && requester.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // Find member to remove
  const memberToRemove = await prisma.workspaceMember.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!memberToRemove) {
    throw new Error("Member not found");
  }

  // Make sure member belongs to this workspace
  if (memberToRemove.workspaceId !== workspaceId) {
    throw new Error("Member does not belong to this workspace");}

  // Owner cannot be removed
  if (memberToRemove.role === "OWNER") {
    throw new Error("Owner cannot be removed");
  }

  // Admin cannot remove another Admin
  if (
    requester.role === "ADMIN" &&
    memberToRemove.role === "ADMIN"
  ) {
    throw new Error("Admins cannot remove other admins");
  }

  // Remove member
  const deletedMember = await prisma.$transaction(async (tx) => {
    const deleted = await tx.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });

    await tx.notification.create({
      data: {
        type: "WORKSPACE_INVITE", // Reusing existing enum
        title: "Removed from Workspace",
        message: `You were removed from ${workspace.name}.`,
        userId: memberToRemove.userId,
      }
    });

    return deleted;
  });

  return deletedMember;
};

export const updateMemberRole = async (workspaceId: string,memberId: string,role: Role,userId: string) => {
  
  // 1. Check if workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // 2. Check if logged-in user belongs to this workspace
  const requester = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!requester) {
    throw new Error("You are not a member of this workspace");
  }

  // 3. Only OWNER can change roles
  if (requester.role !== "OWNER") {
    throw new Error("Only the workspace owner can update member roles");
  }

  // 4. Find the member whose role will be updated
  const member = await prisma.workspaceMember.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  // 5. Make sure the member belongs to this workspace
  if (member.workspaceId !== workspaceId) {
    throw new Error("Member does not belong to this workspace");
  }

  // 6. Don't allow changing the owner's role
  if (member.role === "OWNER") {
    throw new Error("Owner role cannot be changed");
  }

  // 7. Update the role
  const updatedMember = await prisma.$transaction(async (tx) => {
    const updated = await tx.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await tx.notification.create({
      data: {
        type: "WORKSPACE_INVITE",
        title: "Role Changed",
        message: `Your role in ${workspace.name} was changed to ${role}.`,
        userId: member.userId,
      }
    });

    return updated;
  });

  return updatedMember;
};

export const getPendingInvitations = async (workspaceId: string, userId: string) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    throw new Error("Forbidden");
  }

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { workspaceId, status: "PENDING" },
    include: {
      inviter: { select: { id: true, name: true, email: true, avatar: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch user data for the invitees if they exist
  const inviteeEmails = invitations.map(inv => inv.inviteeEmail);
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: inviteeEmails } },
    select: { id: true, name: true, email: true, avatar: true }
  });

  const usersByEmail = new Map(existingUsers.map(u => [u.email, u]));

  return invitations.map(inv => ({
    ...inv,
    invitee: usersByEmail.get(inv.inviteeEmail) || null
  }));
};

export const getReceivedInvitations = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { inviteeEmail: user.email, status: "PENDING" },
    include: {
      inviter: { select: { id: true, name: true, email: true, avatar: true } },
      workspace: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return invitations.map(inv => ({
    ...inv,
    invitee: user
  }));
};

export const acceptInvitation = async (invitationId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitationId }
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  const isInvitee = invitation.inviteeEmail === user.email;

  if (!isInvitee) {
    throw new Error("Only the invited user can accept this invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation is no longer pending");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update the invitation status to ACCEPTED
    await tx.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" }
    });

    const targetUserId = user.id;

    // 2. Check if the user is already a member to avoid unique constraint violations
    const existingTargetMember = await tx.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: targetUserId,
        },
      },
      include: {
        workspace: true
      }
    });

    // Mark notification as read
    await tx.notification.updateMany({
      where: { entityId: invitationId, type: "WORKSPACE_INVITE" },
      data: { isRead: true }
    });

    if (existingTargetMember) {
      // User is already a member. The invitation status is already updated to ACCEPTED.
      return existingTargetMember;
    }

    // 3. Create the workspace member
    const newMember = await tx.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: targetUserId,
        role: invitation.role
      },
      include: {
        workspace: true
      }
    });

    await tx.notification.create({
      data: {
        type: "WORKSPACE_INVITE",
        title: "Workspace Joined",
        message: `You joined ${newMember.workspace.name}.`,
        userId: targetUserId,
      }
    });

    return newMember;
  });
};

export const rejectInvitation = async (invitationId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitationId }
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  const isInvitee = invitation.inviteeEmail === user.email;

  if (!isInvitee) {
    throw new Error("Only the invited user can reject this invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation is no longer pending");
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: "REJECTED" }
    });

    await tx.notification.updateMany({
      where: { entityId: invitationId, type: "WORKSPACE_INVITE" },
      data: { isRead: true }
    });

    return updated;
  });
};

export const cancelInvitation = async (invitationId: string, userId: string) => {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitationId }
  });

  if (!invitation) throw new Error("Invitation not found");

  if (invitation.inviterId !== userId) {
    throw new Error("Only the sender can cancel this invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Only pending invitations can be cancelled");
  }

  return await prisma.$transaction(async (tx) => {
    const deletedInvitation = await tx.workspaceInvitation.delete({
      where: { id: invitationId }
    });

    await tx.notification.deleteMany({
      where: { entityId: invitationId, type: "WORKSPACE_INVITE" }
    });

    return deletedInvitation;
  });
};