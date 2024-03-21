import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { userRouter } from "./friend-userRouter";

const messageRouter = Router({ mergeParams: true });

messageRouter.get("/", async (req: Request, res: Response) => {
  const messages = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          username: req.params.uName,
        },
      },
    },
  })
  
  res.json(messages);
})

userRouter.use("/:uName/messages", messageRouter);

