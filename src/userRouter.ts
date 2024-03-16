import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "./db/prisma";
import { validateData } from "./middleware/validationMiddleware";
import { userRegistrationSchema } from "./schemas/userSchema";

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

export default userRouter;
