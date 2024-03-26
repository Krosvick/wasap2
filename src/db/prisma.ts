import { PrismaClient } from "@prisma/client";

//const prisma = new PrismaClient();

const SinglePrisma = () => {
    return new PrismaClient();
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof SinglePrisma> //eslint-disable-line no-var
};

const prisma = global.prismaGlobal ?? SinglePrisma();
export default prisma;
