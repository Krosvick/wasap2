import { Router, Request, Response } from "express";
import { validateRequestBody } from "zod-express-middleware";
import { sendMessageSchema } from "../../schemas/messagesSchema";
import { io } from "../..";
import prisma from "../../db/prisma";
import z from "zod";

export const messageRouter = Router({ mergeParams: true });

messageRouter.get("/", async (req: Request, res: Response) => {
  const messages = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          username: req.params.username,
        },
      },
    },
  });

  //console.log(req.params.uName);

  res.json(messages);
});

messageRouter.post(
  "/send",
  validateRequestBody(sendMessageSchema),
  async (req, res) => {
    //retrieve the sender from the url
    const sender = req.params.username;
    //retrieve the message and conversationId from the request body
    const { message, conversationId } = req.body;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
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
            id: conversationId,
          },
        },
      },
    });
    //emit the message
    io.to(conversationId).emit("message", { sender, message });

    res.json({ message: "Message sent" });
  },
);
