import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../db/prisma";
import { generateAccessToken } from "../middleware/jwtMiddleware";
import { validateRequestBody } from "zod-express-middleware";
import { userRegistrationSchema, userLoginSchema } from "../schemas/userSchema";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";

const authRouter = Router();
authRouter.use(cookieParser());

authRouter.post(
  "/signup",
  validateRequestBody(userRegistrationSchema),
  (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    prisma.user
      .create({
        data: {
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: hashedPassword,
          friendList: {
            create: {},
          },
        },
      })
      .then((user) => {
        console.log(user);
        res.sendStatus(StatusCodes.CREATED);
      })
      .catch((error) => {
        console.log(error);
        res.sendStatus(StatusCodes.BAD_REQUEST);
      });
  },
);

authRouter.post("/login", validateRequestBody(userLoginSchema), (req, res) => {
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
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Invalid password" });
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
});
authRouter.get("/cookies", (req: Request, res: Response) => {
  res.json(req.cookies);
});

export default authRouter;
