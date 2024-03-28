import express, { Request, Response, Router } from "express";
//import fs from "fs";
import authRouter from "./routers/authRouter";
import { usersRouter } from "./routers/usersRouter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { Server } from "socket.io";
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
export const io = new Server(server, {
  cors: {
    origin: `${process.env.DEVELOPMENT_URL}:${FRONTEND_PORT}`,
    credentials: true,
  },
});

let storedUsers: ISocketInfo[] = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const cookief = socket.handshake.headers.cookie;

  //This should be the socket where the user enters conversation.
  //Should receive the conversation id.
  socket.on("enter-conversation", async (data) => {
    //delete previous data if any.
    storedUsers = leaveRoom(socket.id, storedUsers);

    const convId = data.conversation.id;
    const userId = getCookieFromSocket(cookief);
    console.log(`User ${userId} is trying to join to ${convId}`);

    if (!userId || !convId) {
      return;
    }

    //Make sure we joined the conversation.
    const joinResponse = await socket.join(convId);
    console.log(`User ${userId} joined to ${convId}`, joinResponse);

    //Send the status to clients in the 'Whatsapp-like' thing.
    socket.emit("user-status", {
      status: "connected",
    });

    storedUsers.push({ id: socket.id, userId, convId });

    debugLogs(LOG_TYPES.INFO, `User ${userId} joined to ${convId}`);
  });

  // Listen for incoming chat messages
  socket.on("send-message", async (data) => {
    const userId = getCookieFromSocket(cookief);

    if (!userId) {
      return;
    }

    console.log(`Received message from ${userId}:`, data);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        username: true,
        id: true,
      },
    });

    if (!user) {
      return;
    }

    const convTarget = storedUsers.find(
      (sender) => sender.userId === user.id,
    )?.convId;

    debugLogs(
      LOG_TYPES.INFO,
      `Trying to send a message to the room: ${convTarget} from ${user.username}`,
    );

    if (!convTarget) return;

    //Send message anyways.
    io.to(convTarget).emit("send-message", {
      user: user.username,
      message: data.message,
    });

    //LOG INFO ABOUT THE MESSAGE.
    debugLogs(
      LOG_TYPES.INFO,
      `Message Info: Room ${convTarget}, User: ${user.username} Message: ${data.message}`,
    );

    const actualConv = await isValidConversation(convTarget);

    if (!actualConv) {
      debugLogs(
        LOG_TYPES.WARNING,
        `User ${user.username} is trying to send the ${data.message} message to DB in Room ${convTarget}`,
      );
      return;
    }

    debugLogs(
      LOG_TYPES.INFO,
      `Saving to DB: User: ${user.username} Message: ${data.message}`,
    );

    await saveMessage(convTarget, data.message, user.username)
      .then((message) => {
        console.log("Message saved!", message.id);
      })
      .catch((err) => {
        debugLogs(LOG_TYPES.ERROR, err);
      });
  });

  // Listen for user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    storedUsers = leaveRoom(socket.id, storedUsers);
  });
});

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
});
