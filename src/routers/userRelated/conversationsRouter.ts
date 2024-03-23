import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";

export const convRouter = Router({ mergeParams: true });

convRouter.get("/", async (req: Request, res: Response) => {
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
});

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
