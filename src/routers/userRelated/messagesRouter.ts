import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";

export const messageRouter = Router({ mergeParams: true });

//This may be on env.
const DEFAULT_MESSAGE_LIMIT = 1000;

const LIMIT = "limit";
const UNREAD = "unread";

messageRouter.get("/", async (req: Request, res: Response) => {
  const limit = req.query[LIMIT] ? Number(req.query[LIMIT]) : DEFAULT_MESSAGE_LIMIT;
  const onlyUnread = req.query[UNREAD] ? Boolean(req.query[UNREAD]) : false;

  const messages = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          username: req.params.username,
        },
      },
      messages: {
        some: {
          isSeen : onlyUnread,
        }
      }
    },
    take: limit,
  });

  res.json(messages);
});
