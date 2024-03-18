import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const secret = process.env.JWT_SECRET;

function generateAccessToken(username: string): string {
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment");
  }
  return jwt.sign({ user: username }, secret, { expiresIn: 60 });
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  const verify = jwt.verify(token, process.env.TOKEN_SECRET as string);
  if (verify) {
    next();
  } else {
    res.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export { generateAccessToken, authenticateToken };
