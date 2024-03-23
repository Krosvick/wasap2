import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "zod-express-middleware";
import { sendMessageSchema } from "../../schemas/messagesSchema";

import { io } from "../..";
import { authenticateJWTCookie } from "../../middleware/jwtMiddleware";

export const convRouter = Router({ mergeParams: true });

convRouter.get(
  "/",
  authenticateJWTCookie,
  async (req: Request, res: Response) => {
    if (!req.params.username) {
      const conversations = await prisma.conversation.findMany({
        select: {
          id: true,
          participants: {
            //we only care abt the username not the other weird stuff.
            select: {
              username: true,
            },
          },
          messages: {
            select: {
              content: true,
              //this may look better one-lined.
              sender: { select: { username: true } },
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      res.json(conversations);
    } else {
      const conversations = await prisma.conversation.findMany({
        select: {
          id: true,
          participants: {
            //we only care abt the username not the other weird stuff.
            select: {
              username: true,
            },
          },
          messages: {
            select: {
              content: true,
              //this may look better one-lined.
              sender: { select: { username: true } },
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        where: {
          participants: {
            some: {
              username: req.params.username,
            },
          },
        },
      });
      res.json(conversations);
    }
  },
);

convRouter.get("/:convId", async (req: Request, res: Response) => {
  const convId = req.params.convId;
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: convId,
    },
    select: {
      id: true,
      participants: {
        select: {
          username: true,
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
  });

  if (!conversation) {
    res.status(StatusCodes.NOT_FOUND).send("Conversation not found!");
    return;
  }

  res.json(conversation);
});

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
    await prisma.message.create({
      data: {
        content: message,
        sender: {
          connect: {
            username: sender,
          },
        },
        conversation: {
          connect: {
            id: convId,
          },
        },
      },
    });
    //emit the message
    io.to(convId).emit("message", { sender, message });

    res.json({ message: "Message sent" });
  },
);
