import prisma from "./src/config/prisma.js";
import { acceptInvitation } from "./src/services/workspace.service.js";

async function run() {
  const invitations = await prisma.workspaceInvitation.findMany({ where: { status: "PENDING" } });
  
  for (const inv of invitations) {
    console.log(`Trying to accept invitation ${inv.id} for ${inv.inviteeEmail}`);
    const user = await prisma.user.findUnique({ where: { email: inv.inviteeEmail } });
    if (!user) {
      console.log(`User ${inv.inviteeEmail} not found!`);
      continue;
    }
    try {
      const result = await acceptInvitation(inv.id, user.id);
      console.log(`Success:`, result);
    } catch (err) {
      console.error(`Failed to accept ${inv.id}:`, err.message);
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
