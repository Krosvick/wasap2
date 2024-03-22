import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { StatusCodes } from "http-status-codes";

export const contactsRouter = Router({ mergeParams: true });

contactsRouter.get("/", async (req: Request, res: Response) => {
  const uName = req.params.id;

  if (!uName) {
    res.send("Not valid user?");
    return;
  }

  const userObj = await prisma.user.findUnique({ where: { username: uName } });

  if (userObj === null) {
    res.status(StatusCodes.NOT_FOUND).send("User not found!");
    return;
  }

  const friends = userObj.friendListIds;

  res.json(friends);
});