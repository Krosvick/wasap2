import { Router, Request, Response } from "express";
import { messageRouter } from "./messagesRouter";
import { contactsRouter } from "./contactsRouter";
import prisma from "../db/prisma";
//import { StatusCodes } from "http-status-codes";

//const app = express();

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

// Friend router stuff

// Mount friendRouter under usersRouter
usersRouter.use("/:id/friends", contactsRouter);
usersRouter.use("/:uName/messages", messageRouter);

export { usersRouter };
