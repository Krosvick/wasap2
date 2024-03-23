import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { authenticateJWTCookie } from "../middleware/jwtMiddleware";
import { validateRequestBody } from "zod-express-middleware";
import { addFriendSchema } from "../schemas/userSchema";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";

const userRouter = Router();

userRouter.use(cookieParser());

userRouter.post(
  "/removefriend",
  validateRequestBody(addFriendSchema), authenticateJWTCookie,
  async (req, res) => {
    const { userId, friendUsername } = req.body;

    const friendId = await prisma.user.findFirst({
      where: {
        username: friendUsername,
      },
      select: {
        id: true,
      },
    });

    if (!friendId || userId === friendId.id) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "There is no friend to be deleted." });
      return;
    }

    prisma.friendlist
      .update({
        where: {
          userId: userId,
        },
        data: {
          userFriends: {
            disconnect: [{ id: friendId.id }],
          },
        },
      })
      .then(() => {
        res.json({
          message: `Removed ${friendUsername} from your friendlist.`,
        });
      })
      .catch((err) => {
        res.json({ message: err.message });
      });
  },
);

userRouter.post(
  "/addfriend",
  validateRequestBody(addFriendSchema), authenticateJWTCookie,
  async (req, res) => {
    const { userId, friendUsername } = req.body;
    const friendId = await prisma.user.findFirst({
      where: {
        username: friendUsername,
      },
    });
    if (!friendId) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Friend not found" });
      return;
    }
    if (userId === friendId.id) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "You can't add yourself as a friend" });
      return;
    }
    const userFriendList = await prisma.friendlist.findFirst({
      where: {
        userId: userId,
      },
    });
    if (!userFriendList) {
      //create a friendlist for the user if it doesn't exist
      prisma.friendlist
        .create({
          data: {
            userId: userId,
          },
        })
        .then(() => {
          prisma.user
            .update({
              where: {
                id: userId,
              },
              data: {
                friendList: {
                  update: {
                    userFriends: {
                      connect: {
                        id: friendId.id,
                      },
                    },
                  },
                },
              },
            })
            .then(async (user) => {
              //create a conversation between the user and the friend
              await prisma.conversation
                .create({
                  data: {
                    participants: {
                      connect: [{ id: userId }, { id: friendId.id }],
                    },
                  },
                })
                .then((conversation) => {
                  res.json({ user, conversation });
                });
            })
            .catch((error) => {
              res.json({ error: error.message });
            });
        });
    }

    prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          friendList: {
            update: {
              userFriends: {
                connect: {
                  id: friendId.id,
                },
              },
            },
          },
        },
      })
      .then(async (user) => {
        //create a conversation between the user and the friend
        await prisma.conversation
          .create({
            data: {
              participants: {
                connect: [{ id: userId }, { id: friendId.id }],
              },
            },
          })
          .then((conversation) => {
            res.json({ user, conversation });
          });
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  },
);

userRouter.get("/cookie", (req: Request, res: Response) => {
  res.json({ cookies: req.cookies });
});

export default userRouter;
