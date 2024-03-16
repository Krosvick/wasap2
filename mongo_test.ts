import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  const allUsers = await prisma.users.findMany();
  console.log(allUsers);
  console.log("whats this?");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("frikin connected?!!?!");
    await prisma.$disconnect();
  })