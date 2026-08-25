import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  const workspaces = await prisma.workspace.findMany();
  const invitations = await prisma.workspaceInvitation.findMany();
  const members = await prisma.workspaceMember.findMany();
  console.log("Users:", users.length);
  console.log("Workspaces:", workspaces.length);
  console.log("Invitations:", invitations.map(i => ({ id: i.id, status: i.status, email: i.inviteeEmail })));
  console.log("Members:", members.length);
}
run().catch(console.error).finally(() => prisma.$disconnect());
