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

function authenticateJWTCookie(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies["token"];

  if (!token) 
    return res.sendStatus(StatusCodes.UNAUTHORIZED);

  const verify = jwt.verify(token, process.env.JWT_SECRET as string);
  if (verify) {
    next();
  } else {
    res.statusCode = StatusCodes.UNAUTHORIZED;
  }
}


export { generateAccessToken, authenticateJWTCookie };
