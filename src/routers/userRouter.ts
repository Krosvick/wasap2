import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../db/prisma";
import jwt from "jsonwebtoken";
import { validateData } from "../middleware/validationMiddleware";
import { userRegistrationSchema, userLoginSchema } from "../schemas/userSchema";

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
          res.status(404).json({ error: "User not found" });
          return;
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          res.status(401).json({ error: "Invalid password" });
          return;
        }
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          {
            expiresIn: "1h",
          },
        );
        res.json({ token });
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  },
);

userRouter.post("/addfriend", async (req: Request, res: Response) => {
  const { userId, friendUsername } = req.body;
  const friendId = await prisma.user.findFirst({
    where: {
      username: friendUsername,
    },
  });
  if (!friendId) {
    res.status(404).json({ error: "Friend not found" });
    return;
  }
  if (userId === friendId.id) {
    res.status(400).json({ error: "You can't add yourself as a friend" });
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
});

export default userRouter;
