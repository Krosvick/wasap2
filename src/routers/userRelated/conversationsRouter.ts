import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "zod-express-middleware";
import { sendMessageSchema } from "../../schemas/messagesSchema";
import { authenticateJWTCookie } from "../../middleware/jwtMiddleware";
import { saveMessage } from "../../chat_helpers";
import { decrypt, encrypt } from "../../encryption";

export const convRouter = Router({ mergeParams: true });

const findConversations = async (participantId: string = "") => {
  const conversations = await prisma.conversation.findMany({
    select: {
      id: true,
      participants: {
        select: {
          id: true,
          username: true,
        },
        where: {
          id: {
            not: participantId,
          },
        },
      },
      messages: {
        select: {
          content: true,
          sender: { select: { username: true } },
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    where: participantId
      ? {
          participants: {
            some: {
              id: participantId,
            },
          },
        }
      : undefined,
  });
  //res.json(conversations);
  return conversations;
};

convRouter.get(
  "/",
  authenticateJWTCookie,
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (userId) {
      const conversations = await findConversations(userId);

      if (conversations.length > 0) {
        res.json(conversations);
        return;
      }

      res.json({ message: `Conversations with ${userId} not found.` });
    } else {
      const conversations = await findConversations();
      res.json(conversations);
    }
  },
);

convRouter.get(
  "/:convId",
  authenticateJWTCookie,
  async (req: Request, res: Response) => {
    const convId = req.params.convId;
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: convId,
      },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
            username: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            sender: { select: { username: true } },
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send("Conversation not found!");
      return;
    }

    res.json(conversation);
  },
);

convRouter.post(
  "/:convId/send",
  validateRequest(sendMessageSchema),
  authenticateJWTCookie,
  async (req, res) => {
    //retrieve the sender from the url
    const sender = req.params.username;
    const convId = req.params.convId;
    //retrieve the message from the body
    const { message } = req.body;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: convId,
        participants: {
          some: {
            username: sender,
          },
        },
      },
    });
    if (!conversation) {
      //conversation must exist before sending a message
      res.json({ error: "Conversation does not exist" });
      return;
    }
    //create the message
    await saveMessage(convId, message, sender);
    //emit the message
    //io.to(convId).emit("message", { sender, message });

    res.json({ message: "Message sent" });
  },
);

//i like writing everything twice.
//FIXME: THIS IS NOT SAFE FOR E2E AS WE USE THE GLOBAL KEY, BUT ASSUME THAT NOBODY KNOWS THE IV AND KEY.
convRouter.get(
  "/:convId/decrypted",
  authenticateJWTCookie,
  async (req: Request, res: Response) => {
    const convId = req.params.convId;
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: convId,
      },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
            username: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            sender: { select: { username: true } },
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send("Conversation not found!");
      return;
    }

    //there should be a better way to do this.
    conversation.messages.forEach((msg) => {
      const content = msg.content;
      const decrypted = decrypt(Buffer.from(content))?.toString('hex');

      if(!decrypted) {
        return;
      }

      msg.content = decrypted;
    })

    res.json(conversation);
  },
);

convRouter.post(
  "/:convId/sendEncrypted",
  validateRequest(sendMessageSchema),
  authenticateJWTCookie,
  async (req, res) => {
    //retrieve the sender from the url
    const sender = req.params.username;
    const convId = req.params.convId;
    //retrieve the message from the body
    const { message } = req.body;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: convId,
        participants: {
          some: {
            username: sender,
          },
        },
      },
    });
    if (!conversation) {
      //conversation must exist before sending a message
      res.json({ error: "Conversation does not exist" });
      return;
    }

    const encryptedMsg = encrypt(message)?.toString('hex');

    if(!encryptedMsg) {
      res.status(StatusCodes.BAD_REQUEST).json({error: "Message can't be encrypted for some reason."});
      return;
    }
  
    await saveMessage(convId, encryptedMsg, sender);

    res.json({ message: "Message sent" });
  },
);

