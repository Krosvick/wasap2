import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const secret = process.env.JWT_SECRET;

function generateAccessToken(id: string): string {
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment");
  }
  return jwt.sign({ id: id }, secret, { expiresIn: "1h" });
}

function authenticateJWTCookie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies["token"];

  if (!token) return res.sendStatus(StatusCodes.UNAUTHORIZED);

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET as string);
    if (verify) {
      next();
    }
  } catch (error) {
    res.clearCookie("token");
    res.statusCode = StatusCodes.UNAUTHORIZED;
    res.send("Unauthorized");
  }
}

export { generateAccessToken, authenticateJWTCookie };
