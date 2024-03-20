import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../db/prisma";
import { generateAccessToken, authenticateToken } from "../utils/jwt_helpers";
import { validateData } from "../middleware/validationMiddleware";
import {
  userRegistrationSchema,
  userLoginSchema,
  addFriendSchema,
} from "../schemas/userSchema";
import { StatusCodes } from "http-status-codes";

const userRouter = Router();

userRouter.post(
  "/signup",
  validateData(userRegistrationSchema),
  (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    prisma.user
      .create({
        data: {
          username,
          email,
          password: hashedPassword,
          contacts: {
            create: {},
          },
        },
      })
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  },
);

userRouter.post(
  "/login",
  validateData(userLoginSchema),
  (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    prisma.user
      .findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      })
      .then((user) => {
        if (!user) {
          res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
          return;
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid password" });
          return;
        }
        const token = generateAccessToken(user.username);
        console.log(token);
        res.cookie("token", token);
        res.json({ token });
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  },
);

userRouter.post(
  "/addfriend",
  [validateData(addFriendSchema), authenticateToken],
  async (req: Request, res: Response) => {
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
      res.status(StatusCodes.BAD_REQUEST).json({ error: "You can't add yourself as a friend" });
      return;
    }
    prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          contacts: {
            update: {
              friends: {
                connect: {
                  id: friendId.id,
                },
              },
            },
          },
        },
      })
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  },
);

export default userRouter;
