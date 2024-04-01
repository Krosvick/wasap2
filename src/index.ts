import express, { Request, Response, Router } from "express";
//import fs from "fs";
import authRouter from "./routers/authRouter";
import { usersRouter } from "./routers/usersRouter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { STATUS_CODES, createServer } from "node:http";
import { join } from "node:path";
import { convRouter } from "./routers/userRelated/conversationsRouter";
import cookieParser from "cookie-parser";
import { LOG_TYPES, debugLogs, getCookieFromSocket, getToken } from "./helpers";
import prisma from "./db/prisma";
import { authenticateJWTCookie } from "./middleware/jwtMiddleware";
import {
  leaveRoom,
  ISocketInfo,
  isValidConversation,
  saveMessage,
} from "./chat_helpers";
import { StatusCodes } from "http-status-codes";
import { LiveChatSocket, StaticChatSocket } from "./sockets/wrappers";
import { decrypt, encrypt } from "./encryption";

const VIEWS_DIR = join(__dirname, "..", "pseudoviews");

const app = express();

const FRONTEND_PORT = process.env.FRONTEND_PORT;

const corsOptions = {
  //vite port.
  origin: `${process.env.DEVELOPMENT_URL}:${FRONTEND_PORT}`,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//This is only for testing the io external script.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  //json response explaining the different api routes
  res.json({
    "/api": "Base API route",
    "/api/users": "Get all users",
    "/api/users/:username": "Get a user by username",
    "/api/users/:username/friends": "Get a user's friends",
    "api/users/:username/conversations": "Get a user's conversations",
    "/api/users/:username/messages": "Get a user's messages",
  });
});

const apiRouter = Router();

app.use("/api", apiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/conversations", convRouter);

const server = createServer(app);
const liveChat = new StaticChatSocket(server, {
  cors: {
    origin: `${process.env.DEVELOPMENT_URL}:${FRONTEND_PORT}`,
    credentials: true,
  },
})

liveChat.initialize();

app.get("/socket", authenticateJWTCookie, (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/socket_test.html");
});

app.get("/form", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/login.html");
});

app.get(
  "/conversation_test/:convId/",
  authenticateJWTCookie,
  async (req: Request, res: Response) => {
    const convId = req.params.convId;
    //same as lua array thing.
    const token = req.cookies.token;

    if (!token) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Is this even possible?" });
      return;
    }
    const currentUserId = getToken(token);

    //THIS SHOULDN'T BE POSSIBLE.
    if (!currentUserId) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "You need to log in." });
      return;
    }

    const isValid = await isValidConversation(convId, currentUserId);

    if (!isValid) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "This is not the conversation of yours or it was not found.",
      });
      return;
    }

    res.sendFile(VIEWS_DIR + "/conversation_live.html");
  },
);

//display this url on the message.
const DEVELOPMENT_URL = process.env.DEVELOPMENT_URL;
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running at ${DEVELOPMENT_URL}:${PORT}`);
  const encryted = encrypt("amongus");

  console.log(encryted ? decrypt(encryted)?.toString("utf-8") : "ayuda");
});
