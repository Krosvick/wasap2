import prisma from "./db/prisma";

interface ISocketInfo {
    id: string;
    userId : string;
    convId : string;
}

const leaveRoom = (socketId : string, allUsers : ISocketInfo[]) => {
    return allUsers.filter(user => user.id !== socketId);
}

const isValidConversation = async (convId : string, participantId? : string | undefined) => {
    return !!await prisma.conversation.findFirst({
        where: {
            id: convId,
            participants: {
                some: {
                  id: participantId,
                }
            }
        },
        select: {
            id: true,
        }
    });
}

const saveMessage = async (convId : string, content : string, username : string) => {
    return prisma.message.create({
        data: {
          content: content,
          sender: {
            connect: {
              username: username,
            },
          },
          conversation: {
            connect: {
              id: convId,
            },
          },
        },
    });
} 

export {leaveRoom, ISocketInfo, isValidConversation, saveMessage}