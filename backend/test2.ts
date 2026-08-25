import prisma from "./src/config/prisma.js";

async function run() {
  const invitations = await prisma.workspaceInvitation.findMany();
  console.log('Invitations:', invitations);
}
run().catch(console.error).finally(() => prisma.$disconnect());
