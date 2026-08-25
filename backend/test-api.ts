import axios from 'axios';
import prisma from "./src/config/prisma.js";

async function run() {
  const user = await prisma.user.findFirst({ where: { email: 'alice123@gmail.com' } });
  
  // Actually we need a token. We can't easily mock a token here without signing it.
}
run();
