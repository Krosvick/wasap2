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

/*usersRouter.get("/:uName", async (req: Request, res: Response) => {
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
*/

usersRouter.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const select = {
    id: true,
    username: true,
    email: true,
    friendList: {
      select: {
        userFriendsId: true,
      },
    },
  };
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select,
  });

  if (!user) {
    res.send(`No user with id ${userId} was found!`);
    return;
  }

  res.json(user);
});

// Mount additional router for nested resource
usersRouter.use("/:userId/friends", contactsRouter);
usersRouter.use("/:userId/conversations", convRouter);
usersRouter.use("/:userId/messages", messageRouter);

export { usersRouter };
