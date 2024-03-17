import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "./db/prisma";
import jwt from "jsonwebtoken";
import { validateData } from "./middleware/validationMiddleware";
import { userRegistrationSchema, userLoginSchema } from "./schemas/userSchema";

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

export default userRouter;
