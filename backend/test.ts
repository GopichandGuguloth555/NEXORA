import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function run() {
  const invitations = await prisma.workspaceInvitation.findMany();
  console.log('Invitations:', invitations);
}
run().catch(console.error).finally(() => prisma.$disconnect());
