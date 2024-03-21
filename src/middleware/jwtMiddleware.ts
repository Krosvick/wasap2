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
  const token = req.headers.authorization;

  if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);

  const verify = jwt.verify(token, process.env.TOKEN_SECRET as string);
  if (verify) {
    next();
  } else {
    res.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

function authenticateJWTCookie(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (token == null) 
    return res.sendStatus(StatusCodes.UNAUTHORIZED);

  const verify = jwt.verify(token, process.env.TOKEN_SECRET as string);
  if (verify) {
    next();
  } else {
    res.statusCode = StatusCodes.UNAUTHORIZED;
  }
}


export { generateAccessToken, authenticateToken, authenticateJWTCookie };
