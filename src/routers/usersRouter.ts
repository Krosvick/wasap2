import { Router, Request, Response } from "express";
import { messageRouter } from "./userRelated/messagesRouter";
import { contactsRouter } from "./userRelated/contactsRouter";
import { convRouter } from "./userRelated/conversationsRouter";
import prisma from "../db/prisma";

// Define routers
const usersRouter = Router({ mergeParams: true });

// User router stuff

usersRouter.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  res.json(users);
});

usersRouter.get("/:uName", async (req: Request, res: Response) => {
  const uName = req.params.uName;
  const user = await prisma.user.findUnique({
    where: {
      username: uName,
    },
    select: {
      id: true,
      username: true,
      email: true,
      friendList: {
        select: {
          userFriends: true,
          userFriendsId: true,
        },
      },
    },
  });

  if (!user) {
    res.send(`No user with name ${uName} was found!`);
    return;
  }

  res.json(user);
});

// Mount additional router for nested resource
usersRouter.use("/:username/friends", contactsRouter);
usersRouter.use("/:username/conversations", convRouter);
usersRouter.use("/:username/messages", messageRouter);

export { usersRouter };
