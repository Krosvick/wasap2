import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";

export const messageRouter = Router({ mergeParams: true });

messageRouter.get("/", async (req: Request, res: Response) => {
  const messages = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          username: req.params.uName,
        },
      },
    },
  });

  res.json(messages);
});
