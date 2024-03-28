import prisma from "./db/prisma";

interface ISocketInfo {
    id: string;
    userId : string;
    convId : string;
}

const leaveRoom = (socketId : string, allUsers : ISocketInfo[]) => {
    return allUsers.filter(user => user.id !== socketId);
}

const isValidConversation = async (convId : string) => {
    return !!await prisma.conversation.findFirst({
        where: {
            id: convId,
        },
        select: {
            id: true,
        }
    });
}

export {leaveRoom, ISocketInfo, isValidConversation}