import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequestBody } from "zod-express-middleware";
import { authenticateJWTCookie } from "../../middleware/jwtMiddleware";
import { removeFriendSchema, addFriendSchema } from "../../schemas/userSchema";

export const contactsRouter = Router({ mergeParams: true });

contactsRouter.get("/", async (req: Request, res: Response) => {
  const uId = req.params.userId;
  console.log(req.params);

  if (!uId) {
    res.send("User not specified.");
    return;
  }

  const fList = await prisma.friendlist.findFirst({
    where: {
      owner: {
        id: uId,
      }
    },
    select: {
      userFriends: {
        select: {
          id: true,
          username : true,
          email: true,
        }
      }
    }
  });

  if (!fList) {
    res.status(StatusCodes.NOT_FOUND).send("User not found!");
    return;
  }

  res.json(fList);
});

contactsRouter.post(
  "/removefriend",
  validateRequestBody(removeFriendSchema),
  authenticateJWTCookie,
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

contactsRouter.post(
  "/addfriend",
  validateRequestBody(addFriendSchema),
  authenticateJWTCookie,
  async (req, res) => {
    const userId = req.params.userId;
    const { friendUsername } = req.body;
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
            .catch((error) => {
              res.json({ error: error.message });
            });
        });
    }
    
    //FIXME: The user can update this table every single time if adds a new friend.
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
        //The user may delete friends so we need to preserve the conversation and load it.
        //find a conversation of the user with the friend
        const lastConversation = await prisma.conversation.findFirst({
          where: {
            participants: {
              //filter with userId and friendId
              some: {
                AND: [{ id: userId }, { id: friendId.id }],
              },
            },
            //HACK: Add this boolean because Prisma doesn't have any length based search.
            isGroup: false,
          },
        });

        if (lastConversation !== null) {
          res.json({
            message: `Conversation history with ${friendId.username} is already preserved!`,
          });
          return;
        }

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
