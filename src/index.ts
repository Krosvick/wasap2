import express, { Request, Response, Router } from "express";
//import fs from "fs";
import authRouter from "./routers/authRouter";
import { usersRouter } from "./routers/usersRouter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { join } from "node:path";
import { convRouter } from "./routers/userRelated/conversationsRouter";
import cookieParser from "cookie-parser";
import { LOG_TYPES, debugLogs, getCookieFromSocket } from "./helpers";
import prisma from "./db/prisma";
import { authenticateJWTCookie } from "./middleware/jwtMiddleware";

const VIEWS_DIR = join(__dirname, "..", "pseudoviews");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
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

const port = process.env.PORT || 3000;

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
export const io = new Server(server);

var storedUsers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const cookief = socket.handshake.headers.cookie;

  //This should be the socket where the user enters conversation.
  //Should receive the conversation id.
  socket.on('enter-conversation', async (data) => {
    const convId = data.conversation;
    const userId = getCookieFromSocket(cookief);
    
    if(!userId || !convId) {
      return;
    }

    //Make sure we joined the conversation.
    socket.join(convId);

    //Send the status to clients in the 'Whatsapp-like' thing.
    socket.to(convId).emit("user-status", {
      status : "connected",
    })

    storedUsers.push({id : socket.id, userId, convId});

    const chatUsers = await prisma.conversation.findFirst({
      where: {
        id: convId,
      },
      select : {
        participants: true,
      }
    })

  })

  //socket.on('send-msg')

  // Listen for incoming chat messages
  socket.on('chat message', (data) => {
    let userId = getCookieFromSocket(cookief);
  
    if(!userId) {
      return;
    }

    console.log(`Received message from ${userId}:`, data);

    prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        username : true,
      }
    }).then((user) => {
      io.emit('chat message', {user : user?.username, message : data.message});

      debugLogs(LOG_TYPES.NONE, `User connected:  ${user?.username}`);
    }).catch((err) => {
      console.log("error feo");
    });

    //io.emit('chat message', {user : userData?.username, message : data.message});
  });

  // Listen for user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/socket", authenticateJWTCookie, (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/socket_test.html");
});

app.get("/form", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/login.html");
});

app.get("/conversation", authenticateJWTCookie, (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/conversation.html");
});


server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
