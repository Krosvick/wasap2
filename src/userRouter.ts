import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";

const userRouter = Router();

userRouter.post("/signup", (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword, username);
  res.send("User created");
});

export default userRouter;
