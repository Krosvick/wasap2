import { PrismaClient } from '@prisma/client'
import { ObjectId } from 'bson';

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  // GPT like yes.
  const createUser = await prisma.user.create({
    data: {
      username: 'user100', email: 'user4@example.com', password: 'password1',
    },
  });

  let id : string = createUser.id;

  const friendlist = await prisma.friendlist.create({data: {userId : id}})
  /*
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
  console.log("whats this?");*/
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