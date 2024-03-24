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
import cookie from "cookie"
import jwt from "jsonwebtoken";
import { UserJWT } from "./helpers";

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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const cookief = socket.handshake.headers.cookie;

  let user : string | null = null;
  var sockets = [];

  if(cookief) {
    const parsedCookies = cookie.parse(cookief);
    const token = parsedCookies.token;

    if(!token) return;

    const decodedToken = jwt.decode(token, {complete : true});
    if (!decodedToken) return;
    
    const payload = decodedToken.payload as UserJWT;
    console.log("live parsed cookie reaction: ", token);
    console.log(payload, payload.user);
    
    user = payload.user;
  }

  // Listen for incoming chat messages
  socket.on('chat message', (data) => {
    console.log(`Received message from ${user}:`, data);


    io.emit('chat message', {user : user, message : data.message});
  });

  // Listen for user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/socket", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/socket_test.html");
});

app.get("/form", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/login.html");
});


server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
